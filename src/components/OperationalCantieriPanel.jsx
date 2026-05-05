import { buildOperationalCantiereOptions } from '../lib/cantiereOptions'
import { MoneyValue } from './MoneyValue'
import { StatusBadge } from './StatusBadge'

export function OperationalCantieriPanel({ store, title = 'Cantieri operativi reali', compact = false }) {
  const cantieri = buildOperationalCantiereOptions({ store })
  const summaries = cantieri.map((cantiere) => buildCantiereSummary(cantiere, store))

  if (!summaries.length) return null

  return (
    <section className="internal-panel internal-padded">
      <div className="section-heading panel-title-row">
        <div>
          <h2>{title}</h2>
          <p>Lista unica da store operativo: include anche bozze e cantieri senza movimenti.</p>
        </div>
        <StatusBadge>{summaries.length} cantieri</StatusBadge>
      </div>

      <div className={compact ? 'compact-upload-list' : 'document-card-list'}>
        {summaries.map((summary) => (
          <a className="compact-upload-row" href={`#/dashboard/cantieri/${summary.id}`} key={summary.id}>
            <span className="file-chip file-pdf">C</span>
            <div>
              <strong>{summary.nome}</strong>
              <small>{summary.localita} · {summary.documents} documenti · {summary.movements} movimenti · {summary.photos} foto</small>
            </div>
            <StatusBadge>{summary.total > 0 ? <MoneyValue value={summary.total} /> : 'Bozza'}</StatusBadge>
          </a>
        ))}
      </div>
    </section>
  )
}

function buildCantiereSummary(cantiere, store) {
  const documents = (store?.documents ?? []).filter((item) => (item.cantiereId ?? 'barcelo-roma') === cantiere.id)
  const movements = (store?.movements ?? []).filter((item) => (item.cantiereId ?? 'barcelo-roma') === cantiere.id)
  const photos = (store?.photos ?? []).filter((item) => (item.cantiereId ?? 'barcelo-roma') === cantiere.id)
  const stored = (store?.cantieri ?? []).find((item) => item.id === cantiere.id)
  const total = movements.length
    ? movements.reduce((sum, item) => sum + Number(item.totale || item.importoTotale || 0), 0)
    : documents.reduce((sum, item) => sum + Number(item.totale || item.importoTotale || 0), 0)

  return {
    id: cantiere.id,
    nome: cantiere.nome,
    localita: stored?.localita || 'Da hub',
    documents: documents.length,
    movements: movements.length,
    photos: photos.length,
    total,
  }
}
