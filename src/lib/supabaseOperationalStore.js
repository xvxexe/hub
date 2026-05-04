import { isSupabaseConfigured, supabaseRequest } from './supabaseClient'

const EMPTY_OPERATIONAL_STORE = {
  documents: [],
  photos: [],
  estimates: [],
  notes: [],
  activities: [],
}

export async function fetchOperationalStore() {
  if (!isSupabaseConfigured) return { data: null, error: null, source: 'local' }

  try {
    const [documents, photos, notes, activities] = await Promise.all([
      supabaseRequest('documents?select=*,cantieri(nome)&order=data_documento.desc.nullslast,created_at.desc', { method: 'GET' }),
      supabaseRequest('photos?select=*,cantieri(nome)&order=created_at.desc', { method: 'GET' }),
      supabaseRequest('notes?select=*&order=created_at.desc', { method: 'GET' }),
      supabaseRequest('activity_logs?select=*&order=created_at.desc&limit=100', { method: 'GET' }),
    ])

    const firstError = [documents, photos, notes, activities].find((result) => result.error)
    if (firstError?.error) return { data: null, error: firstError.error, source: 'supabase-operational' }

    const store = {
      ...EMPTY_OPERATIONAL_STORE,
      documents: Array.isArray(documents.data) ? documents.data.map(fromDocumentRow) : [],
      photos: Array.isArray(photos.data) ? photos.data.map(fromPhotoRow) : [],
      notes: Array.isArray(notes.data) ? notes.data.map(fromNoteRow) : [],
      activities: Array.isArray(activities.data) ? activities.data.map(fromActivityRow) : [],
    }

    return {
      data: hasOperationalData(store) ? store : null,
      error: null,
      source: 'supabase-operational',
    }
  } catch (error) {
    return { data: null, error, source: 'supabase-operational' }
  }
}

export async function saveOperationalStore(store, session) {
  if (!isSupabaseConfigured) return { error: null, source: 'local' }
  if (!isValidStoreShape(store)) return { error: new Error('Store operativo non valido'), source: 'supabase-operational' }

  try {
    const cantieri = buildCantieriRows(store)
    const documents = store.documents.map((document) => toDocumentRow(document, session))
    const photos = store.photos.map((photo) => toPhotoRow(photo, session))
    const notes = store.notes.map((note) => toNoteRow(note, session))
    const activities = store.activities.slice(0, 250).map((activity) => toActivityRow(activity, session))
    const movements = store.documents.map((document) => toAccountingMovementRow(document, session))

    const orderedWrites = [
      ['cantieri', cantieri],
      ['documents', documents],
      ['photos', photos],
      ['accounting_movements', movements],
      ['notes', notes],
      ['activity_logs', activities],
    ]

    for (const [table, rows] of orderedWrites) {
      if (!rows.length) continue
      const result = await upsertRows(table, rows)
      if (result.error) return { error: result.error, source: 'supabase-operational' }
    }

    return { error: null, source: 'supabase-operational' }
  } catch (error) {
    return { error, source: 'supabase-operational' }
  }
}

function upsertRows(table, rows) {
  return supabaseRequest(`${table}?on_conflict=id`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
}

function hasOperationalData(store) {
  return Boolean(
    store.documents.length
      || store.photos.length
      || store.notes.length
      || store.activities.length,
  )
}

function isValidStoreShape(store) {
  return Boolean(
    store
      && typeof store === 'object'
      && Array.isArray(store.documents)
      && Array.isArray(store.photos)
      && Array.isArray(store.estimates)
      && Array.isArray(store.notes)
      && Array.isArray(store.activities),
  )
}

function buildCantieriRows(store) {
  const map = new Map()
  ;[...store.documents, ...store.photos].forEach((item) => {
    const id = item.cantiereId ?? 'barcelo-roma'
    const nome = item.cantiere ?? 'Barcelò Roma'
    if (!id) return
    if (!map.has(id)) {
      map.set(id, {
        id,
        nome,
        cliente: nome,
        localita: id === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da hub',
        indirizzo: null,
        stato: 'attivo',
        avanzamento: 0,
        metadata: {},
        updated_at: new Date().toISOString(),
      })
    }
  })
  return [...map.values()]
}

function fromDocumentRow(row) {
  const cantiereName = row.cantieri?.nome ?? row.cantiere_nome ?? row.cantiere_id ?? 'Cantiere'

  return {
    id: row.id,
    cantiereId: row.cantiere_id,
    cantiere: cantiereName,
    tipoDocumento: row.tipo_documento,
    fornitore: row.fornitore,
    descrizione: row.descrizione,
    numeroDocumento: row.numero_documento,
    dataDocumento: row.data_documento,
    categoria: row.categoria,
    imponibile: Number(row.imponibile || 0),
    iva: Number(row.iva || 0),
    totale: Number(row.totale || 0),
    importoTotale: Number(row.totale || 0),
    pagamento: row.pagamento,
    statoVerifica: row.stato_verifica,
    stato: String(row.stato_verifica ?? 'Da verificare').toLowerCase(),
    fileName: row.file_name,
    storagePath: row.storage_path,
    storageBucket: row.storage_path ? 'documents' : null,
    note: row.note,
    nota: row.note,
    sheetTab: row.sheet_tab,
    movimentiCount: row.movimenti_count,
    source: row.source ?? 'supabase-operational',
    dataCaricamento: row.created_at?.slice(0, 10),
    updatedAt: row.updated_at,
  }
}

function toDocumentRow(document, session) {
  const status = document.statoVerifica ?? titleStatus(document.stato) ?? 'Da verificare'
  return {
    id: document.id,
    cantiere_id: document.cantiereId ?? 'barcelo-roma',
    tipo_documento: document.tipoDocumento ?? 'Altro',
    fornitore: document.fornitore ?? null,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    numero_documento: document.numeroDocumento ?? document.fileName ?? null,
    data_documento: document.dataDocumento || null,
    categoria: document.categoria ?? 'Extra / Altro',
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? 'Non indicato',
    stato_verifica: status,
    file_name: document.fileName ?? null,
    storage_path: document.storagePath ?? document.storage_path ?? null,
    note: document.notes ?? document.note ?? document.nota ?? null,
    sheet_tab: document.sheetTab ?? null,
    movimenti_count: Number(document.movimentiCount || 1),
    source: document.source ?? 'hub-ui',
    uploaded_by: session?.authMode === 'supabase' ? session.id : null,
    updated_at: new Date().toISOString(),
  }
}

function fromPhotoRow(row) {
  const cantiereName = row.cantieri?.nome ?? row.cantiere_nome ?? row.cantiere_id ?? 'Cantiere'

  return {
    id: row.id,
    cantiereId: row.cantiere_id,
    cantiere: cantiereName,
    zona: row.zona,
    lavorazione: row.lavorazione,
    avanzamento: row.avanzamento,
    fileName: row.file_name,
    storagePath: row.storage_path,
    storageBucket: row.storage_path ? 'site-photos' : null,
    nota: row.nota,
    pubblicabile: row.pubblicabile,
    pubblicata: row.stato === 'Pubblicata',
    stato: row.stato,
    descrizionePubblica: row.descrizione_pubblica,
    caricatoDa: row.caricato_da ?? 'Utente Supabase',
    dataCaricamento: row.created_at?.slice(0, 10),
    updatedAt: row.updated_at,
  }
}

function toPhotoRow(photo, session) {
  return {
    id: photo.id,
    cantiere_id: photo.cantiereId ?? 'barcelo-roma',
    zona: photo.zona ?? null,
    lavorazione: photo.lavorazione ?? null,
    avanzamento: photo.avanzamento ?? null,
    file_name: photo.fileName ?? null,
    storage_path: photo.storagePath ?? photo.storage_path ?? null,
    nota: photo.nota ?? null,
    pubblicabile: photo.pubblicabile ?? 'da valutare',
    stato: titleStatus(photo.stato) || 'Da revisionare',
    descrizione_pubblica: photo.descrizionePubblica ?? null,
    caricato_da: session?.authMode === 'supabase' ? session.id : null,
    updated_at: new Date().toISOString(),
  }
}

function fromNoteRow(row) {
  return {
    id: row.id,
    text: row.text,
    author: row.author_name ?? 'Utente',
    date: row.created_at?.slice(0, 10),
    entityType: row.entity_type,
    entityId: row.entity_id,
  }
}

function toNoteRow(note, session) {
  return {
    id: note.id,
    entity_type: note.entityType,
    entity_id: note.entityId,
    text: note.text,
    author_id: session?.authMode === 'supabase' ? session.id : null,
    author_name: note.author ?? session?.name ?? 'Sistema',
  }
}

function fromActivityRow(row) {
  return {
    id: row.id,
    date: row.created_at?.slice(0, 10),
    author: row.actor_name ?? 'Sistema',
    type: row.action,
    description: row.description,
    entityType: row.entity_type,
    entityId: row.entity_id,
  }
}

function toActivityRow(activity, session) {
  return {
    id: activity.id,
    entity_type: activity.entityType ?? null,
    entity_id: activity.entityId ?? null,
    action: activity.type ?? 'update',
    description: activity.description ?? activity.title ?? 'Azione hub',
    actor_id: session?.authMode === 'supabase' ? session.id : null,
    actor_name: activity.author ?? session?.name ?? 'Sistema',
  }
}

function toAccountingMovementRow(document, session) {
  return {
    id: `movement-${document.id}`,
    cantiere_id: document.cantiereId ?? 'barcelo-roma',
    document_id: document.id,
    data: document.dataDocumento || null,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore ?? null,
    categoria: document.categoria ?? 'Extra / Altro',
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? 'Non indicato',
    stato_verifica: document.statoVerifica ?? titleStatus(document.stato) ?? 'Da verificare',
    note: document.notes ?? document.note ?? document.nota ?? null,
    created_by: session?.authMode === 'supabase' ? session.id : null,
    updated_at: new Date().toISOString(),
  }
}

function titleStatus(status) {
  const normalized = String(status ?? '').trim().toLowerCase()
  const map = {
    'da verificare': 'Da verificare',
    confermato: 'Confermato',
    incompleto: 'Incompleto',
    'possibile duplicato': 'Possibile duplicato',
    scartato: 'Scartato',
    'da revisionare': 'Da revisionare',
    approvata: 'Approvata',
    pubblicata: 'Pubblicata',
    'non pubblicabile': 'Non pubblicabile',
  }
  return map[normalized] ?? status
}
