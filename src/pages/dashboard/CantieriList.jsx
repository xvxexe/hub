import { useMemo, useState } from 'react'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import {
  formatCurrency,
  formatDate,
  getCantiereTotals,
  mockCantieri,
  statiCantiere,
} from '../../data/mockCantieri'

export function CantieriList() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('tutti')

  const filteredCantieri = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return mockCantieri.filter((cantiere) => {
      const matchesSearch =
        normalizedSearch === '' ||
        cantiere.nome.toLowerCase().includes(normalizedSearch) ||
        cantiere.cliente.toLowerCase().includes(normalizedSearch) ||
        cantiere.localita.toLowerCase().includes(normalizedSearch)
      const matchesStatus = status === 'tutti' || cantiere.stato === status

      return matchesSearch && matchesStatus
    })
  }, [search, status])

  return (
    <>
      <section className="dashboard-header">
        <p className="eyebrow">Cantieri mock</p>
        <h1>Gestione cantieri</h1>
        <p>
          Elenco operativo con ricerca, stato, avanzamento e riepiloghi collegati a foto,
          documenti e spese mock.
        </p>
      </section>

      <section className="cantieri-tools" aria-label="Filtri cantieri">
        <label>
          Cerca per nome
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Es. Barcelò Roma"
          />
        </label>
        <label>
          Stato
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="tutti">Tutti</option>
            {statiCantiere.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="cantieri-grid">
        {filteredCantieri.map((cantiere) => {
          const totals = getCantiereTotals(cantiere)

          return (
            <article className="cantiere-card" key={cantiere.id}>
              <div className="cantiere-card-header">
                <div>
                  <h2>{cantiere.nome}</h2>
                  <p>{cantiere.cliente}</p>
                </div>
                <StatusBadge>{cantiere.stato}</StatusBadge>
              </div>

              <dl className="compact-meta">
                <div>
                  <dt>Localita</dt>
                  <dd>{cantiere.localita}</dd>
                </div>
                <div>
                  <dt>Responsabile</dt>
                  <dd>{cantiere.responsabile}</dd>
                </div>
                <div>
                  <dt>Inizio</dt>
                  <dd>{formatDate(cantiere.dataInizio)}</dd>
                </div>
              </dl>

              <ProgressBar value={cantiere.avanzamento} />

              <div className="cantiere-totals">
                <span>{totals.documenti} documenti</span>
                <span>{totals.foto} foto</span>
                <span>{formatCurrency(totals.spese)}</span>
              </div>

              <a className="button button-secondary" href={`#/dashboard/cantieri/${cantiere.id}`}>
                Apri dettaglio
              </a>
            </article>
          )
        })}
      </section>

      {filteredCantieri.length === 0 ? (
        <section className="empty-state">
          <h2>Nessun cantiere trovato</h2>
          <p>Modifica ricerca o filtro stato per visualizzare altri cantieri mock.</p>
        </section>
      ) : null}
    </>
  )
}
