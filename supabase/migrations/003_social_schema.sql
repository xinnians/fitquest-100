-- FitQuest 100: Social Competition Schema
-- Tables: challenges, challenge_members, battles, feed_items, feed_likes

-- ============================================================
-- 1. Challenges (挑戰群組)
-- ============================================================
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  creator_id uuid not null references public.profiles(id),
  start_date date not null default current_date,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

-- Anyone authenticated can see challenges (needed for join by invite code)
create policy "Authenticated users can view challenges"
  on public.challenges for select
  to authenticated
  using (true);

create policy "Users can create challenges"
  on public.challenges for insert
  to authenticated
  with check (auth.uid() = creator_id);

create policy "Creator can update own challenges"
  on public.challenges for update
  to authenticated
  using (auth.uid() = creator_id);

create policy "Creator can delete own challenges"
  on public.challenges for delete
  to authenticated
  using (auth.uid() = creator_id);

-- ============================================================
-- 2. Challenge Members (挑戰成員)
-- ============================================================
create table public.challenge_members (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

alter table public.challenge_members enable row level security;

-- Members of the same challenge can see each other
create policy "Challenge members can view fellow members"
  on public.challenge_members for select
  to authenticated
  using (
    challenge_id in (
      select challenge_id from public.challenge_members where user_id = auth.uid()
    )
  );

create policy "Users can join challenges"
  on public.challenge_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can leave challenges"
  on public.challenge_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 3. Battles (PK 對戰)
-- ============================================================
create table public.battles (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles(id),
  opponent_id uuid not null references public.profiles(id),
  challenge_id uuid references public.challenges(id),
  metric text not null check (metric in ('check_ins', 'calories')),
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'declined')),
  winner_id uuid references public.profiles(id),
  stake_description text,
  created_at timestamptz not null default now()
);

create index idx_battles_challenger on public.battles (challenger_id);
create index idx_battles_opponent on public.battles (opponent_id);

alter table public.battles enable row level security;

create policy "Battle participants can view"
  on public.battles for select
  to authenticated
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

create policy "Users can create battles"
  on public.battles for insert
  to authenticated
  with check (auth.uid() = challenger_id);

create policy "Participants can update battles"
  on public.battles for update
  to authenticated
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

-- ============================================================
-- 4. Feed Items (動態牆)
-- ============================================================
create table public.feed_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete cascade,
  type text not null,
  content jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_feed_items_challenge_date on public.feed_items (challenge_id, created_at desc);

alter table public.feed_items enable row level security;

-- Members of the same challenge can see feed items
create policy "Challenge members can view feed"
  on public.feed_items for select
  to authenticated
  using (
    challenge_id in (
      select challenge_id from public.challenge_members where user_id = auth.uid()
    )
  );

create policy "Users can create feed items"
  on public.feed_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own feed items"
  on public.feed_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 5. Feed Likes (按讚)
-- ============================================================
create table public.feed_likes (
  feed_item_id uuid not null references public.feed_items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feed_item_id, user_id)
);

alter table public.feed_likes enable row level security;

create policy "Users can view likes on visible feed items"
  on public.feed_likes for select
  to authenticated
  using (
    feed_item_id in (
      select id from public.feed_items where challenge_id in (
        select challenge_id from public.challenge_members where user_id = auth.uid()
      )
    )
  );

create policy "Users can like feed items"
  on public.feed_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike"
  on public.feed_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 6. GRANT permissions
-- ============================================================
grant select, insert, update, delete on public.challenges to authenticated;
grant select, insert, delete on public.challenge_members to authenticated;
grant select, insert, update on public.battles to authenticated;
grant select, insert, delete on public.feed_items to authenticated;
grant select, insert, delete on public.feed_likes to authenticated;
