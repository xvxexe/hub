import { PageHeader } from '../../components/PageHeader'
import { services } from '../../data/mockData'

export function Services() {
  return (
    <>
      <PageHeader eyebrow="Servizi" title="Cartongesso e finiture per cantieri ordinati">
        Soluzioni mock descritte in modo chiaro per la prima base pubblica del sito.
      </PageHeader>
      <section className="section">
        <div className="card-grid">
          {services.map((service) => (
            <article className="info-card" key={service.title}>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
