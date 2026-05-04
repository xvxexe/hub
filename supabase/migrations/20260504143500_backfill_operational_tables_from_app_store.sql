-- Backfill one-time dei dati legacy salvati in public.app_store.data.
-- Non elimina app_store: lo mantiene come fallback durante la transizione.

with legacy_documents as (
  select
    doc->>'id' as id,
    coalesce(nullif(doc->>'cantiereId', ''), 'barcelo-roma') as cantiere_id,
    coalesce(nullif(doc->>'cantiere', ''), 'Barcelò Roma') as cantiere,
    coalesce(nullif(doc->>'tipoDocumento', ''), 'Altro') as tipo_documento,
    nullif(doc->>'fornitore', '') as fornitore,
    coalesce(nullif(doc->>'descrizione', ''), nullif(doc->>'tipoDocumento', ''), 'Documento') as descrizione,
    nullif(coalesce(doc->>'numeroDocumento', doc->>'fileName'), '') as numero_documento,
    case when nullif(doc->>'dataDocumento', '') ~ '^\d{4}-\d{2}-\d{2}$' then nullif(doc->>'dataDocumento', '')::date else null end as data_documento,
    coalesce(nullif(doc->>'categoria', ''), 'Extra / Altro') as categoria,
    coalesce(nullif(doc->>'imponibile', '')::numeric, 0) as imponibile,
    coalesce(nullif(doc->>'iva', '')::numeric, 0) as iva,
    coalesce(nullif(coalesce(doc->>'totale', doc->>'importoTotale'), '')::numeric, 0) as totale,
    coalesce(nullif(doc->>'pagamento', ''), 'Non indicato') as pagamento,
    coalesce(nullif(doc->>'statoVerifica', ''), 'Da verificare') as stato_verifica,
    nullif(doc->>'fileName', '') as file_name,
    nullif(coalesce(doc->>'note', doc->>'nota'), '') as note,
    nullif(doc->>'sheetTab', '') as sheet_tab,
    coalesce(nullif(doc->>'movimentiCount', '')::integer, 1) as movimenti_count,
    coalesce(nullif(doc->>'source', ''), 'legacy-app-store') as source
  from public.app_store s
  cross join lateral jsonb_array_elements(coalesce(s.data->'documents', '[]'::jsonb)) doc
  where s.id = 'default' and doc ? 'id'
), upsert_cantieri as (
  insert into public.cantieri (id, nome, cliente, localita, stato, metadata, updated_at)
  select distinct
    cantiere_id,
    cantiere,
    cantiere,
    case when cantiere_id = 'barcelo-roma' then 'Roma, zona Eur' else 'Da app_store legacy' end,
    'attivo',
    jsonb_build_object('source', 'legacy-app-store'),
    now()
  from legacy_documents
  on conflict (id) do update set
    nome = excluded.nome,
    cliente = excluded.cliente,
    updated_at = now()
  returning id
), upsert_documents as (
  insert into public.documents (
    id, cantiere_id, tipo_documento, fornitore, descrizione, numero_documento, data_documento,
    categoria, imponibile, iva, totale, pagamento, stato_verifica, file_name, note, sheet_tab,
    movimenti_count, source, updated_at
  )
  select
    id, cantiere_id, tipo_documento, fornitore, descrizione, numero_documento, data_documento,
    categoria, imponibile, iva, totale, pagamento, stato_verifica, file_name, note, sheet_tab,
    movimenti_count, source, now()
  from legacy_documents
  on conflict (id) do update set
    cantiere_id = excluded.cantiere_id,
    tipo_documento = excluded.tipo_documento,
    fornitore = excluded.fornitore,
    descrizione = excluded.descrizione,
    numero_documento = excluded.numero_documento,
    data_documento = excluded.data_documento,
    categoria = excluded.categoria,
    imponibile = excluded.imponibile,
    iva = excluded.iva,
    totale = excluded.totale,
    pagamento = excluded.pagamento,
    stato_verifica = excluded.stato_verifica,
    file_name = excluded.file_name,
    note = excluded.note,
    sheet_tab = excluded.sheet_tab,
    movimenti_count = excluded.movimenti_count,
    source = excluded.source,
    updated_at = now()
  returning id
)
insert into public.accounting_movements (
  id, cantiere_id, document_id, data, descrizione, fornitore, categoria, imponibile, iva, totale,
  pagamento, stato_verifica, note, updated_at
)
select
  'movement-' || id,
  cantiere_id,
  id,
  data_documento,
  descrizione,
  fornitore,
  categoria,
  imponibile,
  iva,
  totale,
  pagamento,
  stato_verifica,
  note,
  now()
from legacy_documents
on conflict (id) do update set
  cantiere_id = excluded.cantiere_id,
  document_id = excluded.document_id,
  data = excluded.data,
  descrizione = excluded.descrizione,
  fornitore = excluded.fornitore,
  categoria = excluded.categoria,
  imponibile = excluded.imponibile,
  iva = excluded.iva,
  totale = excluded.totale,
  pagamento = excluded.pagamento,
  stato_verifica = excluded.stato_verifica,
  note = excluded.note,
  updated_at = now();

insert into public.photos (
  id, cantiere_id, zona, lavorazione, avanzamento, file_name, nota, pubblicabile, stato, descrizione_pubblica, updated_at
)
select
  photo->>'id',
  coalesce(nullif(photo->>'cantiereId', ''), 'barcelo-roma'),
  nullif(photo->>'zona', ''),
  nullif(photo->>'lavorazione', ''),
  nullif(photo->>'avanzamento', ''),
  nullif(photo->>'fileName', ''),
  nullif(photo->>'nota', ''),
  coalesce(nullif(photo->>'pubblicabile', ''), 'da valutare'),
  coalesce(nullif(photo->>'stato', ''), 'Da revisionare'),
  nullif(photo->>'descrizionePubblica', ''),
  now()
from public.app_store s
cross join lateral jsonb_array_elements(coalesce(s.data->'photos', '[]'::jsonb)) photo
where s.id = 'default' and photo ? 'id'
on conflict (id) do update set
  cantiere_id = excluded.cantiere_id,
  zona = excluded.zona,
  lavorazione = excluded.lavorazione,
  avanzamento = excluded.avanzamento,
  file_name = excluded.file_name,
  nota = excluded.nota,
  pubblicabile = excluded.pubblicabile,
  stato = excluded.stato,
  descrizione_pubblica = excluded.descrizione_pubblica,
  updated_at = now();

insert into public.notes (id, entity_type, entity_id, text, author_name)
select
  note->>'id',
  coalesce(nullif(note->>'entityType', ''), 'unknown'),
  coalesce(nullif(note->>'entityId', ''), 'unknown'),
  coalesce(nullif(note->>'text', ''), ''),
  nullif(note->>'author', '')
from public.app_store s
cross join lateral jsonb_array_elements(coalesce(s.data->'notes', '[]'::jsonb)) note
where s.id = 'default' and note ? 'id' and nullif(note->>'text', '') is not null
on conflict (id) do update set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  text = excluded.text,
  author_name = excluded.author_name;

insert into public.activity_logs (id, entity_type, entity_id, action, description, actor_name)
select
  activity->>'id',
  nullif(activity->>'entityType', ''),
  nullif(activity->>'entityId', ''),
  coalesce(nullif(activity->>'type', ''), 'legacy-sync'),
  coalesce(nullif(activity->>'description', ''), 'Attività importata da app_store legacy'),
  nullif(activity->>'author', '')
from public.app_store s
cross join lateral jsonb_array_elements(coalesce(s.data->'activities', '[]'::jsonb)) activity
where s.id = 'default' and activity ? 'id'
on conflict (id) do update set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  action = excluded.action,
  description = excluded.description,
  actor_name = excluded.actor_name;
