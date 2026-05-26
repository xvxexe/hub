alter table public.documents
  add column if not exists categoria_originale text,
  add column if not exists qualita_dati text not null default 'Da controllare',
  add column if not exists controllo_matematico text not null default 'Da controllare',
  add column if not exists natura_movimento text,
  add column if not exists stato_collegamento text not null default 'Collegato',
  add column if not exists data_quality_note text;

alter table public.accounting_movements
  add column if not exists categoria_originale text,
  add column if not exists qualita_dati text not null default 'Da controllare',
  add column if not exists controllo_matematico text not null default 'Da controllare',
  add column if not exists natura_movimento text,
  add column if not exists stato_collegamento text not null default 'Collegato',
  add column if not exists data_quality_note text;

create or replace view public.private_area_data_quality_audit as
select
  'movement'::text as record_type,
  m.id,
  m.document_id,
  m.cantiere_id,
  c.nome as cantiere_nome,
  m.data,
  m.fornitore,
  m.descrizione,
  m.categoria,
  m.categoria_originale,
  d.sheet_tab,
  m.imponibile,
  m.iva,
  m.totale,
  round((coalesce(m.imponibile,0) + coalesce(m.iva,0) - coalesce(m.totale,0))::numeric, 2) as delta_matematico,
  m.pagamento,
  m.stato_verifica,
  m.qualita_dati,
  m.controllo_matematico,
  m.natura_movimento,
  m.stato_collegamento,
  m.data_quality_note,
  m.updated_at
from public.accounting_movements m
left join public.documents d on d.id = m.document_id
left join public.cantieri c on c.id = m.cantiere_id
union all
select
  'document'::text as record_type,
  d.id,
  null::text as document_id,
  d.cantiere_id,
  c.nome as cantiere_nome,
  d.data_documento as data,
  d.fornitore,
  d.descrizione,
  d.categoria,
  d.categoria_originale,
  d.sheet_tab,
  d.imponibile,
  d.iva,
  d.totale,
  round((coalesce(d.imponibile,0) + coalesce(d.iva,0) - coalesce(d.totale,0))::numeric, 2) as delta_matematico,
  d.pagamento,
  d.stato_verifica,
  d.qualita_dati,
  d.controllo_matematico,
  d.natura_movimento,
  d.stato_collegamento,
  d.data_quality_note,
  d.updated_at
from public.documents d
left join public.cantieri c on c.id = d.cantiere_id;

create or replace view public.private_area_quality_summary as
select
  record_type,
  qualita_dati,
  controllo_matematico,
  natura_movimento,
  stato_collegamento,
  count(*)::int as righe,
  round(sum(coalesce(totale,0))::numeric, 2) as totale
from public.private_area_data_quality_audit
group by record_type, qualita_dati, controllo_matematico, natura_movimento, stato_collegamento;

create index if not exists documents_quality_idx on public.documents (qualita_dati, controllo_matematico, stato_collegamento);
create index if not exists accounting_movements_quality_idx on public.accounting_movements (qualita_dati, controllo_matematico, stato_collegamento);
create index if not exists documents_categoria_originale_idx on public.documents (categoria_originale);
create index if not exists accounting_movements_categoria_originale_idx on public.accounting_movements (categoria_originale);
