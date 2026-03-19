-- Add LINE user ID to profiles for LINE Login integration
alter table public.profiles add column if not exists line_user_id text unique;
create index if not exists idx_profiles_line_user_id on public.profiles (line_user_id);
