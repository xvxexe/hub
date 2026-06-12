import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumSection,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { PublicVideoGrid } from '../../components/PublicVideo'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { caseStudyHeroImage, workMethod } from '../../data/publicPremiumData'
import { drivePublicProjects } from '../../data/driveProjectPhotos'
import { projectVideosById } from '../../data/driveProjectVideos'
import { serviceImages } from '../../data/publicImages'

const servicesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  justifyContent: 'center',
  alignItems: 'stretch',
  gap: '1rem',
  width: 'min(100%, var(--pub-max))',
  marginInline: 'auto',
}

const fullWidthCardWrapperStyle = {
  display: 'flex',
  minWidth: 0,
  width: '100%',
  height: '100%',
}

const equalCardStyle = {
  width: '100%',
  minHeight: '100%',
}

const resultsGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'stretch',
  gap: '1rem',
  width: 'min(100%, var(--pub-max))',
  marginInline: 'auto',
}

const resultCardItemStyle = {
  flex: '1 1 min(100%, 320px)',
  maxWidth: '386px',
  display: 'flex',
}

export function ProjectDetail({ projectId }) {
  const project = drivePublicProjects.find((item) => item.id === projectId) ?? drivePublicProjects[0]
  const gallery = project.gallery ?? []
  const videos = projectVideosById[project.id] ?? []

  return (
    <>
      <SEO
        title={`${project.title} - case study`}
        description={`${project.title}: case study EuropaService per ${project.category}, ${project.city}, con lavorazioni interne, finiture e gestione cantiere.`}
      />

      <PremiumHero
        eyebrow="Case study"
        title={project.title}
        text={project.longText ?? project.summary}
        image={project.heroImage ?? caseStudyHeroImage}
        imageAlt={project.alt ?? 'Foto reale di cantiere tecnico per case study'}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Torna al portfolio"
        secondaryHref="#/cantieri"
        variant="detail"
        meta={[project.city, project.category, project.status, project.year]}
      />

      <PremiumSection eyebrow="Sintesi" title="Il progetto in breve" text="Un intervento seguito con attenzione a contesto, accessi, priorità operative e qualità finale delle lavorazioni.">
        <div className="premium-key-facts">
          <article><span>Settore</span><strong>{project.metrics[0]}</strong></article>
          <article><span>Ambito</span><strong>{project.metrics[1]}</strong></article>
          <article><span>Anno</span><strong>{project.year}</strong></article>
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Contesto operativo</p>
          <h2>{project.challenge}</h2>
          <p>{project.contextNote ?? 'Intervento organizzato in base ad accessi, aree disponibili, interferenze e priorità operative.'}</p>
        </article>
        <article>
          <p className="premium-eyebrow">Lavorazioni eseguite</p>
          <h2>{project.solution}</h2>
          <p>{project.workNote ?? project.note ?? 'Documentazione fotografica collegata alla scheda cantiere.'}</p>
        </article>
      </section>

      <section className="premium-section premium-section-soft">
        <div className="premium-gallery">
          {gallery.map((photo) => (
            <article className="premium-card" key={photo.id}>
              <SafeImage
                alt={photo.alt}
                className="premium-gallery-image"
                fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
                src={photo.src}
                title={photo.title}
              />
            </article>
          ))}
        </div>
      </section>

      {videos.length ? (
        <PremiumSection eyebrow="Video cantiere" title="Fasi in movimento" text="Clip selezionate dalla stessa cartella Drive del cantiere, integrate in modo fluido nella scheda." tone="soft">
          <PublicVideoGrid videos={videos} />
        </PremiumSection>
      ) : null}

      <PremiumImageSplit
        eyebrow="Metodo applicato"
        title="Ogni fase viene coordinata per mantenere il cantiere pulito e leggibile."
        text="Dalla preparazione alla chiusura, l’intervento viene gestito con attenzione a materiali, sicurezza, lavorazioni collegate e qualità finale degli ambienti."
        image={project.methodImage ?? serviceImages.supportoCantieri.src}
        imageAlt={project.alt ?? serviceImages.supportoCantieri.alt}
        fallbackImage={serviceImages.supportoCantieri.src}
      >
        <div className="premium-tags">
          {project.services.map((service) => <small key={service}>{service}</small>)}
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Servizi realizzati" title="Lavorazioni coinvolte">
        <div style={servicesGridStyle}>
          {project.services.map((service) => (
            <div key={service} style={fullWidthCardWrapperStyle}>
              <PremiumTextCard
                title={service}
                text={project.serviceDetails?.[service] ?? 'Attività inserita nel piano di lavoro del cantiere.'}
                style={equalCardStyle}
              />
            </div>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Risultati" title="Cosa è stato ottenuto" tone="soft">
        <div style={resultsGridStyle}>
          {project.results.map((result) => (
            <div key={result} style={resultCardItemStyle}>
              <PremiumTextCard title={result} text={project.resultDetails?.[result] ?? 'Risultato collegato alle lavorazioni effettive del cantiere.'} />
            </div>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Timeline" title="Processo di lavoro">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumCTA title="Vuoi un risultato simile?" text="Raccontaci il progetto, gli spazi e le priorità. Ti aiutiamo a impostare un cantiere ordinato." />
    </>
  )
}
