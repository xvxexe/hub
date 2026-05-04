import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  ActionList,
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { StatusBadge } from '../../components/StatusBadge'

export function DashboardListPage({ eyebrow, title, description, rows, columns }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('tutti')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const roleOptions = useMemo(() => [...new Set(rows.map((row) => row.role).filter(Boolean))], [rows])

  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesSearch = !normalized || columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(normalized))
      const matchesRole = roleFilter === 'tutti' || row.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [columns, roleFilter, rows, search])

  const selectedRow = filteredRows[selectedIndex] ?? filteredRows[0] ?? rows[0]
  const adminCount = rows.filter((row) => String(row.role).toLowerCase().includes('admin')).length
  const accountingCount = rows.filter((row) => String(row.role).toLowerCase().includes('contabile')).length
  const employeeCount = rows.filter((row) => String(row.role).toLowerCase().includes('dipendente')).length
  const assignedCount = rows.filter((row) => row.currentProject && row.currentProject !== 'Tutti i cantieri').length
  const roleSummary = buildRoleSummary(rows)

  function clearFilters() {
    setSearch('')
    setRoleFilter('tutti')
    setSelectedIndex(0)
  }

  return (
    <>
      <DashboardHeader eyebrow={eyebrow} title={title} description={description}>
        <DataModeBadge>Dati locali</DataModeBadge>
        <a className="button button-primary button-small" href="#/dashboard/impostazioni">Gestisci accessi</a>
      </DashboardHeader>

      <FilterGrid ariaLabel="Filtri dipendenti">
        <label>
          Ricerca
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Nome, ruolo o assegnazione..."
          />
        </label>
        <label>
          Ruolo
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value)
              setSelectedIndex(0)
            }}
          >
            <option value="tutti">Tutti</option>
            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <label>
          Vista
          <select defaultValue="assegnazioni">
            <option value="assegnazioni">Assegnazioni</option>
            <option value="ruoli">Ruoli</option>
          </select>
        </label>
        <button className="button button-secondary" type="button" onClick={clearFilters}>Reset</button>
      </FilterGrid>

      <KpiStrip ariaLabel="Indicatori dipendenti">
        <KpiCard icon="users" label="Persone" value={rows.length} hint={`${filteredRows.length} filtrate`} />
        <KpiCard icon="settings" tone="purple" label="Admin" value={adminCount} hint="Accesso completo" />
        <KpiCard icon="wallet" tone="green" label="Contabili" value={accountingCount} hint="Documenti e report" />
        <KpiCard icon="building" tone="amber" label="Assegnati" value={assignedCount || employeeCount} hint="Cantieri / operatività" />
      </KpiStrip>

      <WorkspaceLayout
        className="employees-workspace"
        sidebar={(
          <>
            {selectedRow ? <EmployeeContextPanel row={selectedRow} /> : null}
            <RoleSummaryPanel rows={roleSummary} />
          </>
        )}
      >
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Squadra ({filteredRows.length})</h2>
              <p>Lista compatta coerente con il resto dell’area privata: ruolo, assegnazione e accessi sono leggibili subito.</p>
            </div>
            <StatusBadge>{roleFilter === 'tutti' ? 'Tutti i ruoli' : roleFilter}</StatusBadge>
          </div>

          {filteredRows.length > 0 ? (
            <div className="document-card-list">
              {filteredRows.map((row, index) => (
                <DataCardRow
                  key={`${row.name}-${row.role}-${row.currentProject}`}
                  icon="users"
                  selected={selectedRow === row}
                  title={row.name}
                  description={`${row.role} · ${row.currentProject}`}
                  status={row.role}
                  meta={columns.map((column) => ({
                    label: column.label,
                    value: row[column.key] ?? '-',
                  }))}
                  action={(
                    <ActionList>
                      <button className="button button-secondary button-small" type="button" onClick={() => setSelectedIndex(index)}>
                        Dettaglio
                      </button>
                      <a className="button button-secondary button-small" href="#/dashboard/impostazioni">Accessi</a>
                    </ActionList>
                  )}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nessun elemento trovato">
              Modifica ricerca o filtro ruolo per visualizzare altri utenti.
            </EmptyState>
          )}
        </section>
      </WorkspaceLayout>
    </>
  )
}

function EmployeeContextPanel({ row }) {
  return (
    <SideContextPanel
      title="Persona selezionata"
      description="Riepilogo rapido di ruolo, assegnazione e prossima azione possibile."
      action={<a className="button button-secondary button-small" href="#/dashboard/impostazioni">Gestisci</a>}
    >
      <div className="document-preview-sheet">
        <div className="recent-upload-title">
          <h3>{row.name}</h3>
          <StatusBadge>{row.role}</StatusBadge>
        </div>
        <p>{row.currentProject}</p>
        <small>{getRoleHint(row.role)}</small>
      </div>

      <section className="extracted-data">
        <h3>Dati operativi</h3>
        <dl className="detail-list">
          <div><dt>Nome</dt><dd>{row.name}</dd></div>
          <div><dt>Ruolo</dt><dd>{row.role}</dd></div>
          <div><dt>Assegnazione</dt><dd>{row.currentProject}</dd></div>
          <div><dt>Permessi</dt><dd>{getPermissionHint(row.role)}</dd></div>
        </dl>
      </section>

      <section className="document-actions-panel">
        <h3>Azioni</h3>
        <a className="button button-primary" href="#/dashboard/impostazioni">Apri impostazioni accessi</a>
        <a className="button button-secondary" href="#/dashboard/caricamenti">Vedi caricamenti</a>
      </section>
    </SideContextPanel>
  )
}

function RoleSummaryPanel({ rows }) {
  return (
    <SideContextPanel title="Riepilogo ruoli" description="Distribuzione della squadra per profilo operativo.">
      <div className="compact-upload-list">
        {rows.map((item) => (
          <article className="compact-upload-row" key={item.role}>
            <span className="file-chip file-pdf">{item.count}</span>
            <div>
              <strong>{item.role}</strong>
              <small>{item.hint}</small>
            </div>
            <StatusBadge>{item.count}</StatusBadge>
          </article>
        ))}
      </div>
    </SideContextPanel>
  )
}

function buildRoleSummary(rows) {
  const grouped = rows.reduce((acc, row) => {
    acc[row.role] = (acc[row.role] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(grouped).map(([role, count]) => ({
    role,
    count,
    hint: count === 1 ? '1 persona' : `${count} persone`,
  }))
}

function getRoleHint(role) {
  const normalized = String(role).toLowerCase()
  if (normalized.includes('admin')) return 'Può gestire area privata, accessi, cantieri e impostazioni.'
  if (normalized.includes('contabile')) return 'Profilo dedicato a documenti, contabilità e report.'
  if (normalized.includes('dipendente')) return 'Profilo operativo per upload e caricamenti dal cantiere.'
  return 'Profilo operativo area privata.'
}

function getPermissionHint(role) {
  const normalized = String(role).toLowerCase()
  if (normalized.includes('admin')) return 'Completi'
  if (normalized.includes('contabile')) return 'Contabilità / documenti'
  if (normalized.includes('dipendente')) return 'Upload / propri caricamenti'
  return 'Da verificare'
}
