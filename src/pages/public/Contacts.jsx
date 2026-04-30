import { PageHeader } from '../../components/PageHeader'
import { company } from '../../data/mockData'

export function Contacts() {
  return (
    <>
      <PageHeader eyebrow="Contatti" title="Parla con EuropaService">
        Dati dimostrativi per la base pubblica v0.1.
      </PageHeader>
      <section className="section">
        <div className="contact-grid">
          <article className="info-card">
            <h2>Telefono</h2>
            <p>{company.phone}</p>
          </article>
          <article className="info-card">
            <h2>Email</h2>
            <p>{company.email}</p>
          </article>
          <article className="info-card">
            <h2>Zona operativa</h2>
            <p>{company.area}</p>
          </article>
        </div>
      </section>
    </>
  )
}
