import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'

export function DashboardListPage({ eyebrow, title, description, rows, columns }) {
  const [search, setSearch] = useState('')
  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return rows

    return rows.filter((row) =>
      columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(normalized)),
    )
  }, [columns, rows, search])

  return (
    <>
      <DashboardHeader eyebrow={eyebrow} title={title} description={description}>
        <DataModeBadge />
      </DashboardHeader>

      <section className="cantieri-tools list-tools">
        <label>
          Ricerca
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cerca nella lista..."
          />
        </label>
      </section>

      <section className="table-card">
        {filteredRows.map((row, index) => (
          <article className="data-row" key={`${title}-${index}`}>
            {columns.map((column) => {
              const value = row[column.key]
              return (
                <div key={column.key}>
                  <small>{column.label}</small>
                  {column.badge ? <StatusBadge>{value}</StatusBadge> : <strong>{value}</strong>}
                </div>
              )
            })}
          </article>
        ))}
        {filteredRows.length === 0 ? (
          <EmptyState title="Nessun elemento trovato">
            Modifica la ricerca per visualizzare altri dati mock.
          </EmptyState>
        ) : null}
      </section>
    </>
  )
}
