import { CTASection, ServiceCard } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { publicServices } from '../../data/publicServices'

export function Services() {
  return (
    <>
      <PageHeader eyebrow="Servizi" title="Edilizia e cartongesso per interni curati">
        Cartongesso, controsoffitti, pareti divisorie, rasature, finiture interne, isolamenti e lavori
        per hotel, negozi e locali commerciali.
      </PageHeader>
      <section className="section">
        <div className="public-grid service-grid">
          {publicServices.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      </section>
      <CTASection title="Hai bisogno di un intervento preciso?" text="Invia una richiesta mock con dati, misure e priorità: la struttura è pronta per essere collegata al futuro backend." />
    </>
  )
}
