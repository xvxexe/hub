import { CTASection } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { whyChooseUs } from '../../data/mockSectors'

export function About() {
  return (
    <>
      <PageHeader eyebrow="Chi siamo" title="EuropaService, metodo e precisione in cantiere">
        Una realtà mock specializzata in edilizia, cartongesso, controsoffitti e finiture interne per clienti privati e professionali.
      </PageHeader>
      <section className="section">
        <div className="detail-layout">
          <article className="public-card">
            <h2>Metodo di lavoro</h2>
            <p>
              Ogni intervento parte da sopralluogo, priorità del cliente e organizzazione delle fasi.
              L’obiettivo è mantenere il cantiere leggibile, pulito e controllabile.
            </p>
          </article>
          <article className="public-card">
            <h2>Esperienza operativa</h2>
            <p>
              EuropaService lavora su cartongesso, finiture interne, manutenzioni e ripristini per abitazioni,
              aziende, hotel, negozi e studi tecnici.
            </p>
          </article>
        </div>
      </section>
      <section className="section section-muted">
        <div className="section-heading"><h2>Valori</h2></div>
        <div className="public-grid">
          {whyChooseUs.map((value) => (
            <article className="public-card" key={value}>
              <h3>{value}</h3>
              <p>Affidabilità, precisione, organizzazione, pulizia e rispetto dei tempi.</p>
            </article>
          ))}
        </div>
      </section>
      <CTASection title="Cerchi una squadra ordinata?" text="Raccontaci il lavoro e prepara una richiesta mock completa." />
    </>
  )
}
