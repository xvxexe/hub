import { useMemo, useState } from 'react'
import {
  PremiumCTA,
  PremiumHero,
  PremiumProjectCard,
  PremiumSection,
  PremiumStats,
  TestimonialMock,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import {
  partners,
  premiumProjects,
  premiumStats,
  testimonials,
} from '../../data/publicPremiumData'

const categories = ['Tutti', 'Retail', 'Hospitality', 'Uffici', 'Residenziale']

export function Projects() {
  const [category, setCategory] = useState('Tutti')
  const filteredProjects = useMemo(
    () => premiumProjects.filter((project) => category === 'Tutti' || project.category === category),
    [category],
  )
  const featured = premiumProjects[0]

  return (
    <>
      <SEO
        title="Cantieri e portfolio"
        description="Portfolio EuropaService: cantieri premium per retail, hospitality, uffici e residenziale con cartongesso, finiture interne e gestione cantiere."
      />

      <PremiumHero
        eyebrow="Cantieri"
        title="I nostri progetti"
        text="Ogni cantiere è una storia di impegno, competenza e collaborazione."
        image={featured.image}
        imageAlt={featured.alt}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Vedi case study"
        secondaryHref={`#/cantieri/${featured.id}`}
        variant="compact"
        meta={['Portfolio', 'Case study', 'Cantieri documentati']}
      />

      <PremiumSection title="Filtra i progetti" text="Esplora i cantieri per settore e tipologia di intervento.">
        <div className="premium-filter-pills" role="list" aria-label="Categorie portfolio">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Progetto in evidenza" title={featured.title} tone="soft">
        <div className="premium-featured-project">
          <PremiumProjectCard featured project={featured} />
          <div className="premium-metric-panel">
            {featured.metrics.map((metric) => <strong key={metric}>{metric}</strong>)}
            <p>{featured.summary}</p>
            <a className="premium-button premium-button-primary" href={`#/cantieri/${featured.id}`}>Apri case study</a>
          </div>
        </div>
      </PremiumSection>

      <PremiumSection
        eyebrow="Griglia progetti"
        title="Cantieri selezionati"
        text="Ogni scheda mostra immagini, città, categoria e una sintesi dell’intervento."
      >
        <div className="premium-project-grid">
          {filteredProjects.map((project) => <PremiumProjectCard key={project.id} project={project} />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Numeri" title="Esperienza trasversale" tone="soft">
        <PremiumStats stats={premiumStats} />
      </PremiumSection>

      <PremiumSection eyebrow="Partner" title="Una rete operativa affidabile">
        <div className="premium-logo-row">
          {partners.map((partner) => <span key={partner}>{partner}</span>)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Testimonianza" title="Cosa apprezzano i clienti" tone="soft">
        <div className="premium-testimonial-grid">
          <TestimonialMock testimonial={testimonials[0]} />
        </div>
      </PremiumSection>

      <PremiumCTA title="Hai un cantiere da organizzare?" text="Partiamo da obiettivi, tempi e vincoli. Il resto lo trasformiamo in un piano operativo chiaro." />
    </>
  )
}
