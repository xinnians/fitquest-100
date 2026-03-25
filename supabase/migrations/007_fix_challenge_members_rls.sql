-- Fix: challenge_members self-referencing RLS bootstrap problem
-- The existing policy requires reading challenge_members to determine visibility,
-- creating a chicken-and-egg issue. Add a direct policy for own memberships.

create policy "Users can view own challenge memberships"
  on public.challenge_members for select
  to authenticated
  using (user_id = auth.uid());
