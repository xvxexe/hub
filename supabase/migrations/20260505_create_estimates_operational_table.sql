create table if not exists public.estimates (
  id text primary key,
  client text not null,
  phone text,
  email text,
  city text,
  customer_type text,
  work_type text,
  urgency text,
  budget text,
  contact_preference text,
  priority text default 'Media',
  status text default 'Nuovo',
  description text,
  internal_notes text,
  cantiere_id text,
  source text,
  created_by uuid,
  request_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists estimates_status_idx on public.estimates(status);
create index if not exists estimates_created_at_idx on public.estimates(created_at desc);
create index if not exists estimates_cantiere_id_idx on public.estimates(cantiere_id);
