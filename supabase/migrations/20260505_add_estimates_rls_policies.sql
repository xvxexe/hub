alter table public.estimates enable row level security;

create policy "estimates_select_by_role"
  on public.estimates
  for select
  using (is_accounting_or_admin());

create policy "estimates_insert_by_role"
  on public.estimates
  for insert
  with check (is_accounting_or_admin());

create policy "estimates_update_by_role"
  on public.estimates
  for update
  using (is_accounting_or_admin())
  with check (is_accounting_or_admin());

create policy "estimates_delete_admin"
  on public.estimates
  for delete
  using (is_admin());
