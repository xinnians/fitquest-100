-- Grant table permissions to authenticated users
-- RLS policies control row-level access, but GRANT controls table-level access

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to anon, authenticated;
grant select, insert, update, delete on public.check_ins to anon, authenticated;
grant select, insert, update, delete on public.meals to anon, authenticated;
grant select, insert, update, delete on public.weight_records to anon, authenticated;
