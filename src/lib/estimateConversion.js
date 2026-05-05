import { supabaseRequest } from './supabaseClient'

export async function convertEstimateToCantiere({ estimate, session }) {
  if (!estimate?.id) return { ok: false, error: 'Preventivo senza id: conversione bloccata.' }
  if (!estimate.client?.trim()) return { ok: false, error: 'Cliente mancante: conversione bloccata.' }

  const cantiereId = estimate.cantiereId || `cantiere-${slugify(estimate.client)}-${Date.now()}`
  const cantiereName = buildCantiereName(estimate)
  const now = new Date().toISOString()

  const cantiereResult = await supabaseRequest('cantieri?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: cantiereId,
      nome: cantiereName,
      cliente: estimate.client.trim(),
      localita: estimate.city?.trim() || 'Da preventivo',
      indirizzo: null,
      stato: 'attivo',
      avanzamento: 0,
      metadata: {
        source: 'estimate-conversion',
        convertedFromEstimateId: estimate.id,
        convertedAt: now,
        convertedBy: session?.name ?? 'Sistema',
        estimateWorkType: estimate.workType ?? null,
        estimateBudget: estimate.budget ?? null,
        estimateUrgency: estimate.urgency ?? null,
      },
      updated_at: now,
    }),
  })

  if (cantiereResult.error) return { ok: false, error: cantiereResult.error.message }

  const estimateResult = await supabaseRequest(`estimates?id=eq.${encodeURIComponent(estimate.id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status: 'Accettato',
      cantiere_id: cantiereId,
      updated_at: now,
    }),
  })

  if (estimateResult.error) return { ok: false, error: estimateResult.error.message }

  const noteResult = await supabaseRequest('notes?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: `note-conversion-${estimate.id}`,
      entity_type: 'cantieri',
      entity_id: cantiereId,
      text: `Cantiere creato da preventivo ${estimate.client}. Lavoro: ${estimate.workType || 'da definire'}. Budget: ${estimate.budget || 'da definire'}.`,
      author_id: session?.authMode === 'supabase' ? session.id : null,
      author_name: session?.name ?? 'Sistema',
    }),
  })

  if (noteResult.error) return { ok: false, error: noteResult.error.message }

  return { ok: true, cantiereId, cantiereName }
}

function buildCantiereName(estimate) {
  const work = estimate.workType ? ` - ${estimate.workType}` : ''
  return `${estimate.client}${work}`.trim()
}

function slugify(value) {
  return String(value ?? 'nuovo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'nuovo'
}
