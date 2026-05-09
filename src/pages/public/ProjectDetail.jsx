import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumSection,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { caseStudyHeroImage, workMethod } from '../../data/publicPremiumData'
import { realPublicProjects } from '../../data/publicRealData'
import { projectImages, serviceImages } from '../../data/publicImages'

export function ProjectDetail({ projectId }) {
  const project = realPublicProjects.find((item) => item.id === projectId) ?? realPublicProjects[0]

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
        image={caseStudyHeroImage}
        imageAlt="Foto reale di cantiere tecnico per case study"
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
          <article><span>Focus</span><strong>{project.metrics[2]}</strong></article>
          <article><span>Anno</span><strong>{project.year}</strong></article>
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Sfida</p>
          <h2>{project.challenge}</h2>
          <p>In contesti ricettivi e tecnici serve lavorare con precisione, rispettando accessi, tempi, pulizia e continuità degli spazi.</p>
        </article>
        <article>
          <p className="premium-eyebrow">Soluzione</p>
          <h2>{project.solution}</h2>
          <p>EuropaService organizza le fasi in modo progressivo, coordinando squadre, materiali e controlli per ottenere un risultato pulito e coerente.</p>
        </article>
      </section>

      <PremiumSection eyebrow="Galleria" title="Wireframe provvisori del progetto" tone="soft">
        <div className="premium-gallery">
          {[
            projectImages.barceloRomaDetail.src,
            projectImages.barceloRomaGalleryOne.src,
            projectImages.barceloRomaGalleryTwo.src,
          ].map((src, index) => (
            <SafeImage
              alt={`${project.title} wireframe ${index + 1}`}
              className="premium-gallery-image"
              fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
              key={`${src}-${index}`}
              src={src}
              title={`${project.title} wireframe provvisorio`}
            />
          ))}
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Metodo applicato"
        title="Ogni fase viene coordinata per mantenere il cantiere pulito e leggibile."
        text="Dalla preparazione alla chiusura, l’intervento viene gestito con attenzione a materiali, sicurezza, lavorazioni collegate e qualità finale degli ambienti."
        image={serviceImages.supportoCantieri.src}
        imageAlt={serviceImages.supportoCantieri.alt}
      >
        <div className="premium-tags">
          {project.services.map((service) => <small key={service}>{service}</small>)}
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Servizi realizzati" title="Lavorazioni coinvolte">
        <div className="premium-feature-grid">
          {project.services.map((service) => (
            <PremiumTextCard
              key={service}
              title={service}
              text="Attività integrata nel piano di lavoro con attenzione a ordine, coordinamento e finitura finale."
            />
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Risultati" title="Cosa è stato ottenuto" tone="soft">
        <div className="premium-feature-grid">
          {project.results.map((result) => <PremiumTextCard key={result} title={result} text="Un risultato concreto per rendere l’intervento più ordinato, funzionale e coerente con gli obiettivi del cliente." />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Timeline" title="Processo di lavoro">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumCTA title="Vuoi un risultato simile?" text="Raccontaci il progetto, gli spazi e le priorità. Ti aiutiamo a impostare un cantiere ordinato." />
    </>
  )
}
