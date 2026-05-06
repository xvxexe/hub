import { isSupabaseConfigured, supabaseRequest } from './supabaseClient'

const EMPTY_OPERATIONAL_STORE = {
  cantieri: [],
  documents: [],
  movements: [],
  photos: [],
  estimates: [],
  notes: [],
  activities: [],
  deletedRecords: [],
}

const ACTIVITY_LOGS_TABLE = 'activity_logs'

export async function fetchOperationalStore() {
  if (!isSupabaseConfigured) return { data: null, error: null, source: 'local' }

  try {
    const [cantieri, documents, movements, photos, estimates, notes, activities, deletedRecords] = await Promise.all([
      supabaseRequest('cantieri?select=*&order=created_at.asc', { method: 'GET' }),
      supabaseRequest('documents?select=*,cantieri(nome)&order=data_documento.desc.nullslast,created_at.desc', { method: 'GET' }),
      supabaseRequest('accounting_movements?select=*,cantieri(nome),documents(file_name,storage_path,tipo_documento,numero_documento,sheet_tab)&order=data.desc.nullslast,created_at.desc', { method: 'GET' }),
      supabaseRequest('photos?select=*,cantieri(nome)&order=created_at.desc', { method: 'GET' }),
      supabaseRequest('estimates?select=*&order=created_at.desc', { method: 'GET' }),
      supabaseRequest('notes?select=*&order=created_at.desc', { method: 'GET' }),
      supabaseRequest('activity_logs?select=*&order=created_at.desc&limit=100', { method: 'GET' }),
      supabaseRequest('deleted_records?select=*&order=deleted_at.desc&limit=100', { method: 'GET' }),
    ])

    const firstError = [cantieri, documents, movements, photos, estimates, notes, activities, deletedRecords].find((result) => result.error)
    if (firstError?.error) return { data: null, error: firstError.error, source: 'supabase-operational' }

    const documentRows = Array.isArray(documents.data) ? documents.data.map(fromDocumentRow) : []
    const movementRows = Array.isArray(movements.data) ? movements.data.map(fromAccountingMovementRow) : []
    const cantiereRows = Array.isArray(cantieri.data) ? cantieri.data.map(fromCantiereRow) : []
    const officialSource = buildOfficialSourceFromCantieri(cantieri.data)

    const store = {
      ...EMPTY_OPERATIONAL_STORE,
      cantieri: cantiereRows,
      documents: documentRows,
      movements: movementRows.length ? movementRows : documentRows.map(documentToAccountingMovement),
      photos: Array.isArray(photos.data) ? photos.data.map(fromPhotoRow) : [],
      estimates: Array.isArray(estimates.data) ? estimates.data.map(fromEstimateRow) : [],
      notes: Array.isArray(notes.data) ? notes.data.map(fromNoteRow) : [],
      activities: Array.isArray(activities.data) ? activities.data.map(fromActivityRow) : [],
      deletedRecords: Array.isArray(deletedRecords.data) ? deletedRecords.data.map(fromDeletedRecordRow) : [],
      source: officialSource,
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
    const cantieri = buildCantieriRows(store).map((cantiere) => toCantiereRow(cantiere, store))
    const documents = store.documents.map((document) => toDocumentRow(document, session))
    const movementsSource = Array.isArray(store.movements) && store.movements.length
      ? store.movements
      : store.documents.map(documentToAccountingMovement)
    const movements = movementsSource.map((movement) => toAccountingMovementRow(movement, session))
    const photos = store.photos.map((photo) => toPhotoRow(photo, session))
    const estimates = store.estimates.map((estimate) => toEstimateRow(estimate, session))
    const notes = store.notes.map((note) => toNoteRow(note, session))
    const activities = store.activities.slice(0, 250).map((activity) => toActivityRow(activity, session))

    const orderedWrites = [
      ['cantieri', cantieri],
      ['documents', documents],
      ['photos', photos],
      ['estimates', estimates],
      ['accounting_movements', movements],
      ['notes', notes],
      [ACTIVITY_LOGS_TABLE, activities],
    ]

    for (const [table, rows] of orderedWrites) {
      if (!rows.length) continue
      const result = table === ACTIVITY_LOGS_TABLE
        ? await insertActivityRows(rows)
        : await upsertRows(table, rows)
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

function insertActivityRows(rows) {
  const insertableRows = rows.filter((row) => row.actor_id)
  if (!insertableRows.length) return { error: null, source: 'supabase-operational' }

  return supabaseRequest(`${ACTIVITY_LOGS_TABLE}?on_conflict=id`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(insertableRows),
  })
}

function hasOperationalData(store) {
  return Boolean(
    store.cantieri.length
      || store.documents.length
      || store.movements.length
      || store.photos.length
      || store.estimates.length
      || store.notes.length
      || store.activities.length
      || store.deletedRecords.length,
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

  ;(store.cantieri ?? []).forEach((cantiere) => {
    if (!cantiere?.id) return
    map.set(cantiere.id, {
      ...cantiere,
      nome: cantiere.nome ?? cantiere.cliente ?? cantiere.id,
      cliente: cantiere.cliente ?? cantiere.nome ?? cantiere.id,
      localita: cantiere.localita ?? 'Da hub',
      stato: cantiere.stato ?? 'attivo',
      avanzamento: Number(cantiere.avanzamento || 0),
    })
  })

  ;[...store.documents, ...(store.movements ?? []), ...store.photos].forEach((item) => {
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
        metadata: buildCantiereMetadata(store, id),
        updatedAt: new Date().toISOString(),
      })
    }
  })
  return [...map.values()]
}

function buildCantiereMetadata(store, cantiereId) {
  const officialMaster = store?.source?.officialMaster ?? store?.source?.masterSummary ?? null
  const source = store?.source ?? null

  return {
    ...(source ? { source } : {}),
    ...(officialMaster ? { officialMaster } : {}),
    cantiereId,
    lastHubImportAt: new Date().toISOString(),
  }
}

function fromCantiereRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    cliente: row.cliente ?? row.nome,
    localita: row.localita ?? '',
    indirizzo: row.indirizzo ?? '',
    stato: row.stato ?? 'attivo',
    avanzamento: Number(row.avanzamento || 0),
    responsabileId: row.responsabile_id,
    metadata: row.metadata ?? {},
    source: row.metadata?.source?.kind ?? row.metadata?.source ?? 'supabase-operational',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toCantiereRow(cantiere, store) {
  return {
    id: cantiere.id,
    nome: cantiere.nome ?? cantiere.cliente ?? 'Cantiere',
    cliente: cantiere.cliente ?? cantiere.nome ?? null,
    localita: cantiere.localita ?? null,
    indirizzo: cantiere.indirizzo ?? null,
    stato: cantiere.stato ?? 'attivo',
    avanzamento: Number(cantiere.avanzamento || 0),
    metadata: {
      ...(cantiere.metadata ?? {}),
      ...(buildCantiereMetadata(store, cantiere.id) ?? {}),
      convertedFromEstimateId: cantiere.convertedFromEstimateId ?? cantiere.metadata?.convertedFromEstimateId ?? null,
    },
    updated_at: new Date().toISOString(),
  }
}

function buildOfficialSourceFromCantieri(rows) {
  const row = Array.isArray(rows) ? rows.find((item) => item.metadata?.officialMaster || item.metadata?.source) : null
  if (!row) return null
  const metadata = row.metadata ?? {}
  const source = metadata.source ?? null
  const officialMaster = metadata.officialMaster ?? source?.officialMaster ?? source?.masterSummary ?? null

  if (!source && !officialMaster) return null

  return {
    ...(source ?? {}),
    ...(officialMaster ? { officialMaster } : {}),
  }
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

function fromAccountingMovementRow(row) {
  const linkedDocument = row.documents ?? {}
  return {
    id: row.id,
    cantiereId: row.cantiere_id,
    cantiere: row.cantieri?.nome ?? row.cantiere_id ?? 'Cantiere',
    documentId: row.document_id,
    data: row.data,
    descrizione: row.descrizione,
    fornitore: row.fornitore ?? 'Non indicato',
    categoria: row.categoria ?? 'Extra / Altro',
    tipoDocumento: linkedDocument.tipo_documento ?? 'Movimento',
    numeroDocumento: linkedDocument.numero_documento ?? row.document_id ?? row.id,
    sheetTab: linkedDocument.sheet_tab ?? row.sheetTab ?? '',
    imponibile: Number(row.imponibile || 0),
    iva: Number(row.iva || 0),
    totale: Number(row.totale || 0),
    pagamento: row.pagamento ?? 'Non indicato',
    statoVerifica: row.stato_verifica ?? 'Da verificare',
    documentoCollegato: linkedDocument.file_name ?? linkedDocument.numero_documento ?? '',
    fileName: linkedDocument.file_name,
    storagePath: linkedDocument.storage_path,
    storageBucket: linkedDocument.storage_path ? 'documents' : null,
    note: row.note ?? '',
    updatedAt: row.updated_at,
  }
}

function toAccountingMovementRow(movement, session) {
  return {
    id: movement.id,
    cantiere_id: movement.cantiereId ?? 'barcelo-roma',
    document_id: movement.documentId || null,
    data: movement.data || null,
    descrizione: movement.descrizione ?? 'Movimento contabile',
    fornitore: movement.fornitore ?? null,
    categoria: movement.categoria ?? 'Extra / Altro',
    imponibile: Number(movement.imponibile || 0),
    iva: Number(movement.iva || 0),
    totale: Number(movement.totale || 0),
    pagamento: movement.pagamento ?? 'Non indicato',
    stato_verifica: movement.statoVerifica ?? 'Da verificare',
    note: movement.note ?? null,
    created_by: session?.authMode === 'supabase' ? session.id : null,
    updated_at: new Date().toISOString(),
  }
}

function documentToAccountingMovement(document) {
  return {
    id: `movement-${document.id}`,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    documentId: document.id,
    data: document.dataDocumento || null,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    tipoDocumento: document.tipoDocumento ?? 'Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    sheetTab: document.sheetTab ?? '',
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? 'Non indicato',
    statoVerifica: document.statoVerifica ?? titleStatus(document.stato) ?? 'Da verificare',
    documentoCollegato: document.fileName ?? document.numeroDocumento ?? '',
    fileName: document.fileName,
    storagePath: document.storagePath,
    storageBucket: document.storageBucket ?? 'documents',
    note: document.notes ?? document.note ?? document.nota ?? '',
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

function fromEstimateRow(row) {
  return {
    id: row.id,
    client: row.client,
    phone: row.phone,
    email: row.email,
    city: row.city,
    customerType: row.customer_type,
    workType: row.work_type,
    urgency: row.urgency,
    budget: row.budget,
    contactPreference: row.contact_preference,
    priority: row.priority ?? 'Media',
    status: row.status ?? 'Nuovo',
    description: row.description,
    internalNotes: row.internal_notes,
    cantiereId: row.cantiere_id,
    source: row.source ?? 'supabase-operational',
    requestDate: row.request_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toEstimateRow(estimate, session) {
  return {
    id: estimate.id,
    client: estimate.client ?? 'Cliente da verificare',
    phone: estimate.phone ?? null,
    email: estimate.email ?? null,
    city: estimate.city ?? null,
    customer_type: estimate.customerType ?? null,
    work_type: estimate.workType ?? null,
    urgency: estimate.urgency ?? null,
    budget: estimate.budget ?? null,
    contact_preference: estimate.contactPreference ?? null,
    priority: estimate.priority ?? 'Media',
    status: estimate.status ?? 'Nuovo',
    description: estimate.description ?? null,
    internal_notes: estimate.internalNotes ?? null,
    cantiere_id: estimate.cantiereId ?? null,
    source: estimate.source ?? 'hub-ui',
    created_by: session?.authMode === 'supabase' ? session.id : null,
    request_date: estimate.requestDate || null,
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

function fromDeletedRecordRow(row) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    reason: row.reason,
    deletedBy: row.deleted_by,
    deletedAt: row.deleted_at,
    snapshot: row.snapshot,
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
