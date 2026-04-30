import { getRole } from '../../lib/roles'

export function Unauthorized({ path, role }) {
  const activeRole = getRole(role)

  return (
    <section className="dashboard-header unauthorized-page">
      <p className="eyebrow">Accesso non autorizzato</p>
      <h1>Pagina non disponibile per questo ruolo</h1>
      <p>
        La protezione è solo frontend/mock, ma questa sezione non fa parte del menu e dei permessi
        previsti per il ruolo {activeRole.label}.
      </p>
      <div className="unauthorized-actions">
        <a className="button button-primary" href="#/dashboard">
          Torna alla dashboard
        </a>
        <span>Route richiesta: {path}</span>
      </div>
    </section>
  )
}
