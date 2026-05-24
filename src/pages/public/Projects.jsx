import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProjectCard,
  PremiumSection,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { projectsHeroImage } from '../../data/publicPremiumData'
import { drivePublicProjects } from '../../data/driveProjectPhotos'
import { serviceImages } from '../../data/publicImages'

export function Projects() {
  const featured = drivePublicProjects[0]

  return (
    <>
      <SEO
        title="Cantieri e portfolio"
        description="Portfolio EuropaService: case study e lavorazioni con dati disponibili e verificabili."
      />

      <PremiumHero
        eyebrow="Cantieri"
        title="Cantieri documentati con attenzione a ordine e qualità"
        text="Mostriamo interventi con informazioni operative e foto collegate. Le immagini senza attribuzione certa restano in un archivio separato da verificare."
        image={projectsHeroImage}
        imageAlt="Foto reale di cantiere edile per portfolio"
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Apri case study"
        secondaryHref={`#/cantieri/${featured.id}`}
        variant="compact"
        meta={['Hospitality', 'Roma', 'Capri', 'Foto reali']}
      />

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

      <PremiumSection eyebrow="Case study" title="Cantieri pubblicati" text="Le schede raccolgono foto e contesto operativo per ogni cantiere riconoscibile.">
        <div className="premium-project-grid">
          {drivePublicProjects.map((project) => <PremiumProjectCard key={project.id} project={project} />)}
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

      <PremiumSection eyebrow="Case study" title="Cosa raccontiamo di ogni intervento">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Contesto" text="Tipologia di struttura, area di lavoro e vincoli principali del cantiere." />
          <PremiumTextCard title="Lavorazioni" text="Attività eseguite, fasi coordinate e servizi coinvolti nell’intervento." />
          <PremiumTextCard title="Risultato" text="Miglioramenti ottenuti in ordine, funzionalità, finiture e qualità percepita degli spazi." />
        </div>
      </PremiumSection>

      <PremiumCTA title="Hai un cantiere da organizzare?" text="Partiamo da obiettivi, tempi e vincoli. Il resto lo trasformiamo in un piano operativo chiaro." />
    </>
  )
}
