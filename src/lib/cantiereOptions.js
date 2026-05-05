export function buildOperationalCantiereOptions({ store = null, rows = [], uploads = [] } = {}) {
  const map = new Map()

  ;(store?.cantieri ?? []).forEach((cantiere) => {
    if (!cantiere?.id) return
    map.set(cantiere.id, {
      id: cantiere.id,
      nome: cantiere.nome ?? cantiere.cliente ?? cantiere.id,
      source: 'cantieri',
    })
  })

  ;[...rows, ...(store?.documents ?? []), ...(store?.movements ?? []), ...uploads].forEach((item) => {
    const id = item?.cantiereId ?? 'barcelo-roma'
    const nome = item?.cantiere ?? (id === 'barcelo-roma' ? 'Barcelò Roma' : id)
    if (!map.has(id)) {
      map.set(id, { id, nome, source: 'derived' })
    }
  })

  if (!map.has('barcelo-roma')) {
    map.set('barcelo-roma', { id: 'barcelo-roma', nome: 'Barcelò Roma', source: 'fallback' })
  }

  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome))
}
