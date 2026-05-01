import { useMemo, useState } from 'react'
import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProjectCard,
  PremiumSection,
  PremiumStats,
  PremiumTextCard,
  TestimonialMock,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import {
  partners,
  premiumProjects,
  premiumStats,
  testimonials,
} from '../../data/publicPremiumData'
import { serviceImages } from '../../data/publicImages'

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
        description="Portfolio EuropaService: cantieri per retail, hospitality, uffici e residenziale con cartongesso, finiture interne e gestione cantiere."
      />

      <PremiumHero
        eyebrow="Cantieri"
        title="Cantieri organizzati, documentati e consegnati con metodo"
        text="Ogni progetto racconta una cosa precisa: la qualità finale nasce da come viene gestito il cantiere. Qui trovi esempi di lavorazioni interne, cartongesso, finiture, manutenzioni e supporto operativo in contesti diversi."
        image={featured.image}
        imageAlt={featured.alt}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Apri case study"
        secondaryHref={`#/cantieri/${featured.id}`}
        variant="compact"
        meta={['Portfolio', 'Case study', 'Cantieri documentati', 'Foto avanzamento']}
      />

      <PremiumSection title="Esperienza trasversale" text="Lavoriamo in ambienti con esigenze diverse: strutture ricettive, negozi, uffici, residenziale e spazi commerciali.">
        <PremiumStats stats={premiumStats} />
      </PremiumSection>

      <PremiumSection title="Filtra i progetti" text="Esplora i cantieri per settore e tipologia di intervento." tone="soft">
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

      <PremiumSection eyebrow="Progetto in evidenza" title={featured.title} text={featured.longText}>
        <div className="premium-featured-project">
          <PremiumProjectCard featured project={featured} />
          <div className="premium-metric-panel">
            {featured.metrics.map((metric) => <strong key={metric}>{metric}</strong>)}
            <p>{featured.summary}</p>
            <a className="premium-button premium-button-primary" href={`#/cantieri/${featured.id}`}>Apri case study</a>
          </div>
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Come leggiamo un progetto"
        title="Non guardiamo solo la foto finale. Guardiamo tutto il percorso."
        text="Un buon portfolio non è solo estetica: mostra superfici, dettagli, tempi, vincoli, servizi coinvolti e risultato ottenuto. Ogni case study è pensato per far capire cosa abbiamo risolto e come abbiamo organizzato il lavoro."
        image={serviceImages.finitureInterne.src}
        imageAlt={serviceImages.finitureInterne.alt}
        reverse
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Prima" text="Analisi dello stato attuale, vincoli tecnici, criticità e obiettivi del cliente." />
          <PremiumTextCard title="Durante" text="Fasi coordinate, foto di avanzamento, protezioni e controllo delle interferenze." />
          <PremiumTextCard title="Dopo" text="Verifica dettagli, consegna pulita, risultati misurabili e archivio del progetto." />
        </div>
      </PremiumImageSplit>

      <PremiumSection
        eyebrow="Griglia progetti"
        title="Cantieri selezionati"
        text="Ogni scheda mostra immagini, città, categoria, sintesi dell’intervento e servizi coinvolti."
        tone="soft"
      >
        <div className="premium-project-grid">
          {filteredProjects.map((project) => <PremiumProjectCard key={project.id} project={project} />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Cosa trovi nei case study" title="Informazioni utili, non solo immagini">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Dati chiave" text="Superficie, durata, anno, città, settore e squadra coinvolta." />
          <PremiumTextCard title="Sfida e soluzione" text="Il problema reale del cantiere e il modo in cui è stato risolto operativamente." />
          <PremiumTextCard title="Risultati" text="Cosa è migliorato: tempi, qualità, ordine, funzionalità o percezione degli ambienti." />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Partner" title="Una rete operativa affidabile" tone="soft">
        <div className="premium-logo-row">
          {partners.map((partner) => <span key={partner}>{partner}</span>)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Testimonianze" title="Cosa apprezzano i clienti">
        <div className="premium-testimonial-grid">
          {testimonials.map((testimonial) => <TestimonialMock key={testimonial.author} testimonial={testimonial} />)}
        </div>
      </PremiumSection>

      <PremiumCTA title="Hai un cantiere da organizzare?" text="Partiamo da obiettivi, tempi e vincoli. Il resto lo trasformiamo in un piano operativo chiaro." />
    </>
  )
}
