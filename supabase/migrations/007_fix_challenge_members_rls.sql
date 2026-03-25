-- Fix: challenge_members self-referencing RLS causes infinite recursion
-- Solution: use SECURITY DEFINER functions to break the recursion cycle

-- ============================================================
-- 1. Helper functions (SECURITY DEFINER bypasses RLS)
-- ============================================================

-- Returns challenge IDs for the current user
create or replace function public.get_my_challenge_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select challenge_id from public.challenge_members where user_id = auth.uid();
$$;

-- Returns user IDs of all peers in the current user's challenges
create or replace function public.get_my_challenge_peer_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select distinct cm2.user_id
  from public.challenge_members cm1
  join public.challenge_members cm2 on cm1.challenge_id = cm2.challenge_id
  where cm1.user_id = auth.uid();
$$;

-- ============================================================
-- 2. Fix challenge_members RLS
-- ============================================================

-- Drop the self-referencing policy that causes infinite recursion
drop policy if exists "Challenge members can view fellow members" on public.challenge_members;

-- Users can see their own memberships (base policy)
create policy "Users can view own challenge memberships"
  on public.challenge_members for select
  to authenticated
  using (user_id = auth.uid());

-- Users can see fellow members via SECURITY DEFINER function (no recursion)
create policy "Challenge members can view fellow members v2"
  on public.challenge_members for select
  to authenticated
  using (challenge_id in (select public.get_my_challenge_ids()));

-- ============================================================
-- 3. Fix profiles RLS (allow viewing challenge peers)
-- ============================================================

create policy "Users can view profiles of challenge peers"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or id in (select public.get_my_challenge_peer_ids())
  );

-- ============================================================
-- 4. Fix check_ins RLS (allow viewing challenge peers' check-ins)
-- ============================================================

create policy "Challenge peers can view check-ins"
  on public.check_ins for select
  to authenticated
  using (
    user_id = auth.uid()
    or user_id in (select public.get_my_challenge_peer_ids())
  );

-- ============================================================
-- 5. Fix feed_items RLS (use SECURITY DEFINER function)
-- ============================================================

drop policy if exists "Challenge members can view feed" on public.feed_items;

create policy "Challenge members can view feed v2"
  on public.feed_items for select
  to authenticated
  using (challenge_id in (select public.get_my_challenge_ids()));

-- ============================================================
-- 6. Fix feed_likes RLS (use SECURITY DEFINER function)
-- ============================================================

drop policy if exists "Users can view likes on visible feed items" on public.feed_likes;

create policy "Users can view likes on visible feed items v2"
  on public.feed_likes for select
  to authenticated
  using (
    feed_item_id in (
      select id from public.feed_items where challenge_id in (select public.get_my_challenge_ids())
    )
  );
