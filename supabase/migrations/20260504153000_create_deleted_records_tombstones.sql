create table if not exists public.deleted_records (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  source text,
  storage_bucket text,
  storage_path text,
  reason text,
  deleted_by uuid references public.profiles(id) on delete set null,
  deleted_by_name text,
  deleted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (entity_type, entity_id)
);

create index if not exists deleted_records_entity_idx on public.deleted_records(entity_type, entity_id);
create index if not exists deleted_records_deleted_at_idx on public.deleted_records(deleted_at desc);

alter table public.deleted_records enable row level security;

drop policy if exists deleted_records_select_by_role on public.deleted_records;
create policy deleted_records_select_by_role on public.deleted_records
for select
to authenticated
using (public.is_accounting_or_admin() or deleted_by = auth.uid());

drop policy if exists deleted_records_insert_authenticated on public.deleted_records;
create policy deleted_records_insert_authenticated on public.deleted_records
for insert
to authenticated
with check (auth.uid() is not null and (deleted_by = auth.uid() or public.is_accounting_or_admin()));

drop policy if exists deleted_records_update_admin on public.deleted_records;
create policy deleted_records_update_admin on public.deleted_records
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists deleted_records_delete_admin on public.deleted_records;
create policy deleted_records_delete_admin on public.deleted_records
for delete
to authenticated
using (public.is_admin());
