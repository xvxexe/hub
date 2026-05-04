create extension if not exists pgcrypto;

create or replace function public.current_app_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_app_role() = 'admin'::public.app_role;
$$;

create or replace function public.is_accounting_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_app_role() in ('admin'::public.app_role, 'accounting'::public.app_role);
$$;

create table if not exists public.cantieri (
  id text primary key,
  nome text not null,
  cliente text,
  localita text,
  indirizzo text,
  responsabile_id uuid references public.profiles(id) on delete set null,
  stato text not null default 'attivo',
  avanzamento numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key,
  cantiere_id text references public.cantieri(id) on delete set null,
  tipo_documento text not null default 'Altro',
  fornitore text,
  descrizione text,
  numero_documento text,
  data_documento date,
  categoria text not null default 'Extra / Altro',
  imponibile numeric not null default 0,
  iva numeric not null default 0,
  totale numeric not null default 0,
  pagamento text,
  stato_verifica text not null default 'Da verificare',
  file_name text,
  storage_path text,
  note text,
  sheet_tab text,
  movimenti_count integer not null default 1,
  source text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id text primary key,
  cantiere_id text references public.cantieri(id) on delete set null,
  zona text,
  lavorazione text,
  avanzamento text,
  file_name text,
  storage_path text,
  nota text,
  pubblicabile text not null default 'da valutare',
  stato text not null default 'Da revisionare',
  descrizione_pubblica text,
  caricato_da uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounting_movements (
  id text primary key,
  cantiere_id text references public.cantieri(id) on delete set null,
  document_id text references public.documents(id) on delete set null,
  data date,
  descrizione text,
  fornitore text,
  categoria text not null default 'Extra / Altro',
  imponibile numeric not null default 0,
  iva numeric not null default 0,
  totale numeric not null default 0,
  pagamento text,
  stato_verifica text not null default 'Da verificare',
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  text text not null,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id text primary key,
  entity_type text,
  entity_id text,
  action text not null,
  description text,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cantieri_responsabile_idx on public.cantieri(responsabile_id);
create index if not exists documents_cantiere_idx on public.documents(cantiere_id);
create index if not exists documents_uploaded_by_idx on public.documents(uploaded_by);
create index if not exists documents_status_idx on public.documents(stato_verifica);
create index if not exists photos_cantiere_idx on public.photos(cantiere_id);
create index if not exists photos_uploaded_by_idx on public.photos(caricato_da);
create index if not exists accounting_movements_cantiere_idx on public.accounting_movements(cantiere_id);
create index if not exists accounting_movements_document_idx on public.accounting_movements(document_id);
create index if not exists notes_entity_idx on public.notes(entity_type, entity_id);
create index if not exists activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);

alter table public.cantieri enable row level security;
alter table public.documents enable row level security;
alter table public.photos enable row level security;
alter table public.accounting_movements enable row level security;
alter table public.notes enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "cantieri_select_by_role" on public.cantieri;
create policy "cantieri_select_by_role" on public.cantieri for select using (
  public.is_accounting_or_admin()
  or exists (select 1 from public.user_cantieri uc where uc.user_id = auth.uid() and uc.cantiere_id = cantieri.id)
);

drop policy if exists "cantieri_admin_write" on public.cantieri;
create policy "cantieri_admin_write" on public.cantieri for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "documents_select_by_role" on public.documents;
create policy "documents_select_by_role" on public.documents for select using (
  public.is_accounting_or_admin()
  or uploaded_by = auth.uid()
  or exists (select 1 from public.user_cantieri uc where uc.user_id = auth.uid() and uc.cantiere_id = documents.cantiere_id)
);

drop policy if exists "documents_insert_by_role" on public.documents;
create policy "documents_insert_by_role" on public.documents for insert with check (
  public.is_accounting_or_admin() or uploaded_by = auth.uid()
);

drop policy if exists "documents_update_by_accounting" on public.documents;
create policy "documents_update_by_accounting" on public.documents for update using (public.is_accounting_or_admin()) with check (public.is_accounting_or_admin());

drop policy if exists "documents_delete_admin" on public.documents;
create policy "documents_delete_admin" on public.documents for delete using (public.is_admin());

drop policy if exists "photos_select_by_role" on public.photos;
create policy "photos_select_by_role" on public.photos for select using (
  public.is_accounting_or_admin()
  or caricato_da = auth.uid()
  or exists (select 1 from public.user_cantieri uc where uc.user_id = auth.uid() and uc.cantiere_id = photos.cantiere_id)
);

drop policy if exists "photos_insert_by_role" on public.photos;
create policy "photos_insert_by_role" on public.photos for insert with check (
  public.is_admin() or caricato_da = auth.uid()
);

drop policy if exists "photos_update_admin_or_owner_note" on public.photos;
create policy "photos_update_admin_or_owner_note" on public.photos for update using (
  public.is_admin() or caricato_da = auth.uid()
) with check (
  public.is_admin() or caricato_da = auth.uid()
);

drop policy if exists "photos_delete_admin" on public.photos;
create policy "photos_delete_admin" on public.photos for delete using (public.is_admin());

drop policy if exists "accounting_select_by_role" on public.accounting_movements;
create policy "accounting_select_by_role" on public.accounting_movements for select using (public.is_accounting_or_admin());

drop policy if exists "accounting_write_by_role" on public.accounting_movements;
create policy "accounting_write_by_role" on public.accounting_movements for all using (public.is_accounting_or_admin()) with check (public.is_accounting_or_admin());

drop policy if exists "notes_select_by_role" on public.notes;
create policy "notes_select_by_role" on public.notes for select using (
  public.is_accounting_or_admin()
  or author_id = auth.uid()
);

drop policy if exists "notes_insert_authenticated" on public.notes;
create policy "notes_insert_authenticated" on public.notes for insert with check (auth.uid() is not null and author_id = auth.uid());

drop policy if exists "notes_update_admin" on public.notes;
create policy "notes_update_admin" on public.notes for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "notes_delete_admin" on public.notes;
create policy "notes_delete_admin" on public.notes for delete using (public.is_admin());

drop policy if exists "activity_logs_select_by_role" on public.activity_logs;
create policy "activity_logs_select_by_role" on public.activity_logs for select using (
  public.is_accounting_or_admin()
  or actor_id = auth.uid()
);

drop policy if exists "activity_logs_insert_authenticated" on public.activity_logs;
create policy "activity_logs_insert_authenticated" on public.activity_logs for insert with check (auth.uid() is not null and actor_id = auth.uid());

drop policy if exists "activity_logs_delete_admin" on public.activity_logs;
create policy "activity_logs_delete_admin" on public.activity_logs for delete using (public.is_admin());
