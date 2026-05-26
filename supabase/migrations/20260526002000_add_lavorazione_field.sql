-- Aggiunge un campo esplicito per distinguere la categoria contabile dalla lavorazione/voce operativa.
-- Esempio: categoria = Materiali, lavorazione = Generatore / Fase 2 solaio / Docce esterne.
-- Questa migration è idempotente e non modifica imponibile, IVA o totale.

alter table public.documents
  add column if not exists lavorazione text;

alter table public.accounting_movements
  add column if not exists lavorazione text;

update public.documents
set lavorazione = nullif(coalesce(lavorazione, categoria_originale, sheet_tab), '')
where lavorazione is null;

update public.accounting_movements m
set lavorazione = nullif(coalesce(m.lavorazione, m.categoria_originale, d.sheet_tab), '')
from public.documents d
where d.id = m.document_id
  and m.lavorazione is null;

create index if not exists documents_lavorazione_idx
  on public.documents (lavorazione);

create index if not exists accounting_movements_lavorazione_idx
  on public.accounting_movements (lavorazione);

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
  coalesce(m.lavorazione, m.categoria_originale, d.sheet_tab) as lavorazione,
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
  coalesce(d.lavorazione, d.categoria_originale, d.sheet_tab) as lavorazione,
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
