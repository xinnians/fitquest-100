-- Fix: challenge_members self-referencing RLS causes infinite recursion
-- The existing policy requires reading challenge_members to determine visibility,
-- creating a chicken-and-egg issue. Replace with a direct policy.

-- Drop the self-referencing policy that causes infinite recursion
drop policy if exists "Challenge members can view fellow members" on public.challenge_members;

-- Add direct policy: users can see their own memberships
create policy "Users can view own challenge memberships"
  on public.challenge_members for select
  to authenticated
  using (user_id = auth.uid());
