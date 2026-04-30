import { RecentUploadList } from '../../components/RecentUploadList'
import { Section } from '../../components/Section'
import { quotes } from '../../data/mockData'
import { formatCurrency, getCantiereTotals, mockCantieri } from '../../data/mockCantieri'
import { getRole } from '../../lib/roles'

export function DashboardHome({ session, fotoUploads, documentUploads }) {
  const activeRole = getRole(session.role)

  return (
    <>
      <section className="dashboard-header">
        <p className="eyebrow">Area interna mock</p>
        <h1>{getDashboardTitle(session.role)}</h1>
        <p>{activeRole.description}</p>
        <span className="role-pill role-pill-light">{activeRole.label}</span>
      </section>

      {session.role === 'admin' ? (
        <AdminDashboard fotoUploads={fotoUploads} documentUploads={documentUploads} />
      ) : null}
      {session.role === 'accounting' ? <AccountingDashboard documentUploads={documentUploads} /> : null}
      {session.role === 'employee' ? (
        <EmployeeDashboard session={session} fotoUploads={fotoUploads} documentUploads={documentUploads} />
      ) : null}
    </>
  )
}

function getDashboardTitle(role) {
  if (role === 'accounting') return 'Dashboard contabilità'
  if (role === 'employee') return 'Dashboard dipendente'
  return 'Dashboard admin'
}

function AdminDashboard({ fotoUploads, documentUploads }) {
  const activeSites = mockCantieri.filter((cantiere) => cantiere.stato === 'attivo').length
  const totalCosts = mockCantieri.reduce((total, cantiere) => total + getCantiereTotals(cantiere).spese, 0)
  const openProblems = mockCantieri.reduce((total, cantiere) => total + cantiere.problemi.length, 0)

  return (
    <>
      <div className="stats-grid">
        <Stat label="Cantieri attivi" value={activeSites} />
        <Stat label="Documenti recenti" value={documentUploads.length} />
        <Stat label="Foto recenti" value={fotoUploads.length} />
        <Stat label="Spese mock" value={formatCurrency(totalCosts)} />
      </div>

      <Section title="Cantieri e problemi da controllare">
        <div className="dashboard-card-grid">
          {mockCantieri.slice(0, 3).map((cantiere) => (
            <a className="dashboard-cantiere-link" href="#/dashboard/cantieri" key={cantiere.id}>
              <span>{cantiere.stato}</span>
              <strong>{cantiere.nome}</strong>
              <small>
                {cantiere.localita} · {cantiere.avanzamento}% · {cantiere.problemi.length} alert
              </small>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Preventivi e alert">
        <div className="table-card">
          {quotes.map((quote) => (
            <div className="table-row" key={quote.client}>
              <strong>{quote.client}</strong>
              <span>{quote.request}</span>
              <small>{quote.status}</small>
            </div>
          ))}
          <div className="table-row">
            <strong>Problemi aperti</strong>
            <span>Da controllare nei cantieri</span>
            <small>{openProblems} elementi</small>
          </div>
        </div>
      </Section>
    </>
  )
}

function AccountingDashboard({ documentUploads }) {
  const documentsToCheck = documentUploads.filter((documento) => documento.stato === 'da verificare')
  const invoices = documentUploads.filter((documento) => documento.tipoDocumento === 'Fattura')
  const bankTransfers = documentUploads.filter((documento) => documento.tipoDocumento === 'Bonifico')
  const firRows = documentUploads.filter((documento) => documento.tipoDocumento === 'FIR')
  const possibleDuplicates = documentUploads.filter((documento) => documento.stato === 'possibile duplicato')
  const mockVat = Math.round(
    documentUploads.reduce((total, documento) => total + documento.importoTotale, 0) * 0.22,
  )

  return (
    <>
      <div className="stats-grid">
        <Stat label="Da verificare" value={documentsToCheck.length} />
        <Stat label="Fatture" value={invoices.length} />
        <Stat label="Bonifici" value={bankTransfers.length} />
        <Stat label="IVA mock" value={formatCurrency(mockVat)} />
      </div>

      <Section title="Controlli amministrativi">
        <div className="table-card">
          <AccountingRow label="FIR" value={`${firRows.length} documenti`} />
          <AccountingRow label="Possibili duplicati" value={`${possibleDuplicates.length} elementi`} />
          {mockCantieri.slice(0, 3).map((cantiere) => (
            <AccountingRow
              key={cantiere.id}
              label={cantiere.nome}
              value={formatCurrency(getCantiereTotals(cantiere).spese)}
            />
          ))}
        </div>
      </Section>

      <RecentUploadList title="Documenti recenti" type="documento" uploads={documentUploads.slice(0, 4)} />
    </>
  )
}

function EmployeeDashboard({ session, fotoUploads, documentUploads }) {
  const myPhotos = fotoUploads.filter((upload) => upload.caricatoDa === session.name)
  const myDocuments = documentUploads.filter((upload) => upload.caricatoDa === session.name)

  return (
    <>
      <section className="employee-action-panel">
        <label>
          Scegli cantiere
          <select defaultValue={mockCantieri[0].id}>
            {mockCantieri.map((cantiere) => (
              <option key={cantiere.id} value={cantiere.id}>
                {cantiere.nome}
              </option>
            ))}
          </select>
        </label>
        <div className="employee-actions">
          <a className="button button-primary" href="#/dashboard/upload">
            Carica foto
          </a>
          <a className="button button-secondary" href="#/dashboard/upload">
            Carica documento
          </a>
        </div>
        <label>
          Nota rapida
          <textarea rows="4" placeholder="Scrivi una nota operativa mock" />
        </label>
      </section>

      <section className="upload-recent-layout">
        <RecentUploadList title="Le mie foto" type="foto" uploads={myPhotos.slice(0, 3)} />
        <RecentUploadList
          title="I miei documenti"
          type="documento"
          uploads={myDocuments.slice(0, 3)}
          showAmount={false}
        />
      </section>
    </>
  )
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function AccountingRow({ label, value }) {
  return (
    <div className="table-row">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  )
}
