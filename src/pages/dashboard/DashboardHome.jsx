import { Section } from '../../components/Section'
import { dashboardStats, documents, roles } from '../../data/mockData'
import { formatCurrency, getCantiereTotals, mockCantieri } from '../../data/mockCantieri'

const roleIntro = {
  admin: 'Vista completa per capo/admin: cantieri, documenti, foto, preventivi, contabilità e dipendenti.',
  accounting: 'Vista contabilità: cantieri, documenti, preventivi e movimenti amministrativi.',
  employee: 'Vista dipendente: cantieri assegnati, documenti operativi e foto cantiere.',
}

export function DashboardHome({ session }) {
  const activeRole = roles.find((role) => role.id === session.role)

  return (
    <>
      <section className="dashboard-header">
        <p className="eyebrow">Area interna mock</p>
        <h1>Panoramica operativa</h1>
        <p>{roleIntro[session.role]}</p>
        <span className="role-pill role-pill-light">{activeRole?.label}</span>
      </section>

      <div className="stats-grid">
        {dashboardStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <Section title="Cantieri prioritari">
        <div className="dashboard-card-grid">
          {mockCantieri.slice(0, 3).map((cantiere) => {
            const totals = getCantiereTotals(cantiere)

            return (
              <a className="dashboard-cantiere-link" href="#/dashboard/cantieri" key={cantiere.id}>
                <span>{cantiere.stato}</span>
                <strong>{cantiere.nome}</strong>
                <small>
                  {cantiere.localita} · {cantiere.avanzamento}% · {formatCurrency(totals.spese)}
                </small>
              </a>
            )
          })}
        </div>
      </Section>

      <Section title="Documenti da controllare">
        <div className="table-card">
          {documents.map((document) => (
            <div className="table-row" key={document.name}>
              <strong>{document.project}</strong>
              <span>{document.name}</span>
              <small>{document.status}</small>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
