-- FitQuest 100: Phase 3 — Fix RLS, Boss Battles, Notification tables
-- This migration:
--   1. Fixes check_ins and profiles RLS to allow cross-user reads for challenge members
--   2. Adds boss_battles + boss_damage_log tables
--   3. Adds notification_preferences + notification_log tables

-- ============================================================
-- 1. Fix RLS: Allow challenge members to view each other's check-ins
-- ============================================================

-- Challenge members can view fellow members' check-ins (needed for leaderboard & battle scores)
create policy "Challenge members can view fellow member check-ins"
  on public.check_ins for select
  to authenticated
  using (
    auth.uid() = user_id
    or user_id in (
      select cm2.user_id from public.challenge_members cm1
      join public.challenge_members cm2 on cm1.challenge_id = cm2.challenge_id
      where cm1.user_id = auth.uid()
    )
  );

-- Drop the old restrictive policy (only own check-ins)
drop policy if exists "Users can view own check-ins" on public.check_ins;

-- ============================================================
-- 2. Fix RLS: Allow challenge members to view each other's profiles
-- ============================================================

-- Replace old "view own profile" with broader policy including challenge peers
create policy "Users can view own and peer profiles"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or id in (
      select cm2.user_id from public.challenge_members cm1
      join public.challenge_members cm2 on cm1.challenge_id = cm2.challenge_id
      where cm1.user_id = auth.uid()
    )
  );

drop policy if exists "Users can view own profile" on public.profiles;

-- ============================================================
-- 3. Boss Battles (Boss 戰)
-- ============================================================
create table public.boss_battles (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  boss_name text not null,
  boss_emoji text not null,
  boss_description text,
  boss_color text,
  max_hp int not null,
  current_hp int not null,
  week_start date not null,
  week_end date not null,
  status text not null default 'active' check (status in ('active', 'defeated', 'expired')),
  defeated_at timestamptz,
  rewards_distributed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (challenge_id, week_start)
);

create index idx_boss_battles_challenge_status on public.boss_battles (challenge_id, status);
create index idx_boss_battles_week on public.boss_battles (week_start, week_end);

alter table public.boss_battles enable row level security;

-- Challenge members can view their boss battles
create policy "Challenge members can view boss battles"
  on public.boss_battles for select
  to authenticated
  using (
    challenge_id in (
      select challenge_id from public.challenge_members where user_id = auth.uid()
    )
  );

-- Insert/update only via service role (server actions use admin client)
-- No authenticated insert/update policies needed

grant select on public.boss_battles to authenticated;

-- ============================================================
-- 4. Boss Damage Log (Boss 傷害紀錄)
-- ============================================================
create table public.boss_damage_log (
  id uuid primary key default gen_random_uuid(),
  boss_battle_id uuid not null references public.boss_battles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  damage int not null,
  dealt_at timestamptz not null default now(),
  unique (check_in_id)
);

create index idx_boss_damage_log_boss on public.boss_damage_log (boss_battle_id);
create index idx_boss_damage_log_user on public.boss_damage_log (boss_battle_id, user_id);

alter table public.boss_damage_log enable row level security;

-- Challenge members can view damage logs for their boss battles
create policy "Challenge members can view damage log"
  on public.boss_damage_log for select
  to authenticated
  using (
    boss_battle_id in (
      select id from public.boss_battles where challenge_id in (
        select challenge_id from public.challenge_members where user_id = auth.uid()
      )
    )
  );

-- Users can insert their own damage log entries
create policy "Users can log own damage"
  on public.boss_damage_log for insert
  to authenticated
  with check (auth.uid() = user_id);

grant select, insert on public.boss_damage_log to authenticated;

-- ============================================================
-- 5. Notification Preferences (通知偏好)
-- ============================================================
create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_reminder_enabled boolean not null default true,
  daily_reminder_time time not null default '18:00',
  friend_checkin_enabled boolean not null default true,
  battle_invite_enabled boolean not null default true,
  boss_battle_enabled boolean not null default true,
  weekly_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can view own notification prefs"
  on public.notification_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own notification prefs"
  on public.notification_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own notification prefs"
  on public.notification_preferences for update
  to authenticated
  using (auth.uid() = user_id);

-- Reuse existing update_updated_at trigger
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.update_updated_at();

grant select, insert, update on public.notification_preferences to authenticated;

-- ============================================================
-- 6. Notification Log (通知發送紀錄，用於頻率限制)
-- ============================================================
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  channel text not null,
  sent_at timestamptz not null default now(),
  payload jsonb default '{}'
);

create index idx_notification_log_user_date on public.notification_log (user_id, sent_at desc);
create index idx_notification_log_type_date on public.notification_log (type, sent_at desc);

-- notification_log is only accessed via service role (server-side), no RLS policies needed
-- but enable RLS to be safe (no policies = no authenticated access)
alter table public.notification_log enable row level security;
