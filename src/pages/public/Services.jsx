import { CTASection } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { publicServices } from '../../data/publicServices'

export function Services() {
  return (
    <>
      <SEO
        title="Servizi di cartongesso, controsoffitti e lavori edili"
        description="Servizi EuropaService: cartongesso, controsoffitti, pareti divisorie, rasature, finiture interne, isolamenti, manutenzioni, lavori per hotel e negozi."
      />
      <PageHeader eyebrow="Servizi" title="Lavorazioni interne complete per edilizia, cartongesso e finiture">
        Ogni servizio viene gestito con attenzione a contesto, tempi, ordine di cantiere e qualità della consegna.
        Lavoriamo per privati, aziende, hotel, negozi, studi tecnici e general contractor.
      </PageHeader>
      <section className="section">
        <div className="services-detail-list">
          {publicServices.map((service) => (
            <article className="service-detail-card" id={service.id} key={service.id}>
              <SafeImage
                alt={service.imageAlt}
                className="service-detail-image"
                fallbackSrc={service.fallbackImage}
                src={service.image}
                title={service.seoTitle}
              />
              <div className="service-detail-copy">
                <span className="service-icon">{service.icon}</span>
                <h2>{service.title}</h2>
                <p className="lead-text">{service.description}</p>
                <p>{service.extended}</p>

                <div className="service-detail-panels">
                  <div>
                    <h3>Quando serve</h3>
                    <p>{service.when}</p>
                  </div>
                  <div>
                    <h3>Vantaggi</h3>
                    <ul className="clean-list">
                      {service.benefits.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3>Esempi di applicazione</h3>
                    <ul className="clean-list">
                      {service.examples.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
                <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CTASection
        title="Hai bisogno di capire quale lavorazione serve?"
        text="Descrivi ambiente, misure indicative e obiettivo finale: ti aiuteremo a impostare una richiesta chiara per cartongesso, controsoffitti, rasature, finiture interne o lavori edili."
      />
    </>
  )
}
