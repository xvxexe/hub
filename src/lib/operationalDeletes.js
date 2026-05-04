import { supabaseRequest } from './supabaseClient'
import { deleteOperationalFile } from './supabaseStorage'

const ENTITY_CONFIG = {
  documents: {
    table: 'documents',
    storageBucket: 'documents',
    dependentDeletes: [
      { table: 'accounting_movements', filterColumn: 'document_id' },
      { table: 'notes', filterColumn: 'entity_id', extraFilter: 'entity_type=eq.documents' },
      { table: 'activity_logs', filterColumn: 'entity_id', extraFilter: 'entity_type=eq.documents' },
    ],
  },
  photos: {
    table: 'photos',
    storageBucket: 'site-photos',
    dependentDeletes: [
      { table: 'notes', filterColumn: 'entity_id', extraFilter: 'entity_type=eq.photos' },
      { table: 'activity_logs', filterColumn: 'entity_id', extraFilter: 'entity_type=eq.photos' },
    ],
  },
  estimates: {
    table: 'estimates',
    dependentDeletes: [
      { table: 'notes', filterColumn: 'entity_id', extraFilter: 'entity_type=eq.estimates' },
      { table: 'activity_logs', filterColumn: 'entity_id', extraFilter: 'entity_type=eq.estimates' },
    ],
  },
}

export async function deleteOperationalEntity({ entityType, entity, session, reason = 'Eliminato da hub' }) {
  const config = ENTITY_CONFIG[entityType]
  if (!config) return { ok: false, error: `Tipo entità non eliminabile: ${entityType}` }
  if (!entity?.id) return { ok: false, error: 'Entità senza id: eliminazione bloccata.' }

  if (!canDeleteEntity({ entityType, entity, session })) {
    return { ok: false, error: 'Permessi insufficienti per eliminare questo elemento.' }
  }

  const storageBucket = entity.storageBucket ?? config.storageBucket
  const tombstone = await recordDeletedEntity({ entityType, entity, session, reason, storageBucket })
  if (tombstone.error) return { ok: false, error: tombstone.error.message }

  if (entity.storagePath && storageBucket) {
    const storageResult = await deleteOperationalFile({ bucket: storageBucket, storagePath: entity.storagePath })
    if (storageResult.error) return { ok: false, error: storageResult.error.message }
  }

  for (const dependency of config.dependentDeletes ?? []) {
    const deleted = await deleteRows(dependency.table, dependency.filterColumn, entity.id, dependency.extraFilter)
    if (deleted.error) return { ok: false, error: deleted.error.message }
  }

  const deletedEntity = await deleteRows(config.table, 'id', entity.id)
  if (deletedEntity.error) return { ok: false, error: deletedEntity.error.message }

  return { ok: true }
}

export async function fetchDeletedRecords() {
  const result = await supabaseRequest('deleted_records?select=entity_type,entity_id,source,deleted_at&order=deleted_at.desc', { method: 'GET' })
  if (result.error) return result
  return { ...result, data: Array.isArray(result.data) ? result.data : [] }
}

export function filterDeletedFromStore(store, deletedRecords) {
  if (!store || !Array.isArray(deletedRecords) || deletedRecords.length === 0) return store
  const deleted = new Set(deletedRecords.map((record) => `${record.entity_type}:${record.entity_id}`))

  return {
    ...store,
    documents: Array.isArray(store.documents)
      ? store.documents.filter((document) => !deleted.has(`documents:${document.id}`))
      : [],
    photos: Array.isArray(store.photos)
      ? store.photos.filter((photo) => !deleted.has(`photos:${photo.id}`))
      : [],
    estimates: Array.isArray(store.estimates)
      ? store.estimates.filter((estimate) => !deleted.has(`estimates:${estimate.id}`))
      : [],
  }
}

async function recordDeletedEntity({ entityType, entity, session, reason, storageBucket }) {
  return supabaseRequest('deleted_records?on_conflict=entity_type,entity_id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: `deleted-${entityType}-${entity.id}`,
      entity_type: entityType,
      entity_id: entity.id,
      source: entity.source ?? 'hub',
      storage_bucket: storageBucket ?? null,
      storage_path: entity.storagePath ?? null,
      reason,
      deleted_by: session?.authMode === 'supabase' ? session.id : null,
      deleted_by_name: session?.name ?? 'Sistema',
      deleted_at: new Date().toISOString(),
      metadata: {
        fileName: entity.fileName ?? null,
        cantiereId: entity.cantiereId ?? null,
        cantiere: entity.cantiere ?? null,
        label: entity.descrizione ?? entity.lavorazione ?? entity.fornitore ?? entity.fileName ?? null,
      },
    }),
  })
}

function canDeleteEntity({ entityType, entity, session }) {
  if (session?.role === 'admin') return true
  if (entityType === 'documents' && session?.role === 'accounting') return true
  if (session?.role !== 'employee') return false
  if (entity.caricatoDa !== session.name) return false
  return entityType === 'photos' || entityType === 'documents'
}

function deleteRows(table, column, value, extraFilter) {
  const filters = [`${column}=eq.${encodeURIComponent(value)}`]
  if (extraFilter) filters.push(extraFilter)
  return supabaseRequest(`${table}?${filters.join('&')}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal',
    },
  })
}
