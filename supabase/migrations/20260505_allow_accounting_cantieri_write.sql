create policy "cantieri_insert_accounting"
  on public.cantieri
  for insert
  with check (is_accounting_or_admin());

create policy "cantieri_update_accounting"
  on public.cantieri
  for update
  using (is_accounting_or_admin())
  with check (is_accounting_or_admin());
