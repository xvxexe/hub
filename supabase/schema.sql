create table if not exists public.app_store (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_store enable row level security;

drop policy if exists "Allow public read app_store" on public.app_store;
create policy "Allow public read app_store"
  on public.app_store
  for select
  using (true);

drop policy if exists "Allow public write app_store" on public.app_store;
create policy "Allow public write app_store"
  on public.app_store
  for all
  using (true)
  with check (true);

insert into public.app_store (id, data)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;
