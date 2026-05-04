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

export async function deleteOperationalEntity({ entityType, entity, session }) {
  const config = ENTITY_CONFIG[entityType]
  if (!config) return { ok: false, error: `Tipo entità non eliminabile: ${entityType}` }
  if (!entity?.id) return { ok: false, error: 'Entità senza id: eliminazione bloccata.' }

  if (!canDeleteEntity({ entityType, entity, session })) {
    return { ok: false, error: 'Permessi insufficienti per eliminare questo elemento.' }
  }

  const storageBucket = entity.storageBucket ?? config.storageBucket
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
