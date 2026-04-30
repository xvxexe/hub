import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
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
  const [manager, setManager] = useState('tutti')
  const [sort, setSort] = useState('avanzamento-desc')
  const managers = [...new Set(mockCantieri.map((cantiere) => cantiere.responsabile))]

  const filteredCantieri = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return mockCantieri
      .filter((cantiere) => {
        const matchesSearch =
          normalizedSearch === '' ||
          cantiere.nome.toLowerCase().includes(normalizedSearch) ||
          cantiere.cliente.toLowerCase().includes(normalizedSearch) ||
          cantiere.localita.toLowerCase().includes(normalizedSearch)
        const matchesStatus = status === 'tutti' || cantiere.stato === status
        const matchesManager = manager === 'tutti' || cantiere.responsabile === manager

        return matchesSearch && matchesStatus && matchesManager
      })
      .sort((a, b) => {
        if (sort === 'avanzamento-desc') return b.avanzamento - a.avanzamento
        if (sort === 'avanzamento-asc') return a.avanzamento - b.avanzamento
        if (sort === 'data-desc') return new Date(b.dataInizio) - new Date(a.dataInizio)
        if (sort === 'data-asc') return new Date(a.dataInizio) - new Date(b.dataInizio)
        return a.nome.localeCompare(b.nome)
      })
  }, [manager, search, sort, status])

  return (
    <>
      <DashboardHeader
        eyebrow="Cantieri mock"
        title="Gestione cantieri"
        description="Elenco operativo con ricerca, stato, responsabile, ordinamento e indicatori collegati."
      >
        <DataModeBadge />
      </DashboardHeader>

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
        <label>
          Responsabile
          <select value={manager} onChange={(event) => setManager(event.target.value)}>
            <option value="tutti">Tutti</option>
            {managers.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Ordina
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="avanzamento-desc">Avanzamento alto</option>
            <option value="avanzamento-asc">Avanzamento basso</option>
            <option value="data-desc">Data inizio recente</option>
            <option value="data-asc">Data inizio vecchia</option>
            <option value="nome">Nome</option>
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
                <span>{totals.problemi} problemi</span>
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
