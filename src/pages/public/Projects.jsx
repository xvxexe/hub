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
import { PremiumChipMarquee } from '../../components/PremiumChipMarquee'
import { SEO } from '../../components/SEO'
import {
  partners,
  testimonials,
} from '../../data/publicPremiumData'
import { realPublicProjects } from '../../data/publicRealData'
import { serviceImages } from '../../data/publicImages'

const categories = ['Tutti', 'Hospitality']

export function Projects() {
  const [category, setCategory] = useState('Tutti')
  const filteredProjects = useMemo(
    () => realPublicProjects.filter((project) => category === 'Tutti' || project.category === category),
    [category],
  )
  const featured = realPublicProjects[0]

  return (
    <>
      <SEO
        title="Cantieri e portfolio"
        description="Portfolio EuropaService: case study e lavorazioni per strutture ricettive, interni tecnici, cartongesso, finiture e gestione cantiere."
      />

      <PremiumHero
        eyebrow="Cantieri"
        title="Interventi organizzati per qualità, tempi e ordine operativo"
        text="Ogni cantiere viene seguito con attenzione alle fasi, alla pulizia delle aree di lavoro, al coordinamento delle squadre e alla qualità finale degli ambienti."
        image={featured.image}
        imageAlt={featured.alt}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Apri case study"
        secondaryHref={`#/cantieri/${featured.id}`}
        variant="compact"
        meta={['Hospitality', 'Cartongesso', 'Finiture interne', 'Gestione cantiere']}
      />

      <PremiumSection title="Esperienza in contesti complessi" text="Interveniamo in strutture ricettive, spazi interni e aree tecniche dove servono organizzazione, precisione e continuità durante tutte le fasi di lavoro.">
        <PremiumStats stats={[
          { value: 'Hotel', label: 'strutture ricettive e spazi ad alta percorrenza' },
          { value: 'Interni', label: 'cartongesso, soffitti tecnici e finiture' },
          { value: 'Esterni', label: 'scale, aiuole, scarichi e aree di servizio' },
          { value: 'Metodo', label: 'coordinamento, pulizia e controllo finale' },
        ]} />
      </PremiumSection>

      <PremiumSection title="Filtra i progetti" text="Sfoglia i case study disponibili per settore e tipologia di intervento." tone="soft">
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

      <PremiumSection eyebrow="Cantiere in evidenza" title={featured.title} text={featured.longText}>
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
        eyebrow="Approccio"
        title="Un buon risultato nasce da un cantiere ordinato."
        text="Organizziamo lavorazioni, materiali e priorità per ridurre interferenze e mantenere il controllo su qualità, sicurezza e pulizia. Ogni fase viene gestita con attenzione al contesto in cui si lavora."
        image={serviceImages.finitureInterne.src}
        imageAlt={serviceImages.finitureInterne.alt}
        reverse
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Analisi" text="Valutiamo spazi, accessi, priorità e vincoli prima di iniziare le lavorazioni." />
          <PremiumTextCard title="Esecuzione" text="Coordiniamo le fasi in modo progressivo, mantenendo ordine e continuità operativa." />
          <PremiumTextCard title="Consegna" text="Controlliamo dettagli, pulizia e finiture per lasciare ambienti pronti e coerenti." />
        </div>
      </PremiumImageSplit>

      <PremiumSection
        eyebrow="Portfolio"
        title="Cantieri e lavorazioni"
        text="Una selezione di interventi e aree operative seguite da EuropaService in contesti hospitality e spazi tecnici."
        tone="soft"
      >
        <div className="premium-project-grid">
          {filteredProjects.map((project) => <PremiumProjectCard key={project.id} project={project} />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Case study" title="Cosa raccontiamo di ogni intervento">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Contesto" text="Tipologia di struttura, area di lavoro e vincoli principali del cantiere." />
          <PremiumTextCard title="Lavorazioni" text="Attività eseguite, fasi coordinate e servizi coinvolti nell’intervento." />
          <PremiumTextCard title="Risultato" text="Miglioramenti ottenuti in ordine, funzionalità, finiture e qualità percepita degli spazi." />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Partner" title="Una rete operativa affidabile" tone="soft">
        <PremiumChipMarquee items={partners} className="premium-logo-row" ariaLabel="Partner e filiera" speed="slow" />
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
