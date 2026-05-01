import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumProjectCard,
  PremiumSection,
  PremiumTextCard,
  TestimonialMock,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { premiumProjects, testimonials, workMethod } from '../../data/publicPremiumData'
import { serviceImages } from '../../data/publicImages'

export function ProjectDetail({ projectId }) {
  const project = premiumProjects.find((item) => item.id === projectId) ?? premiumProjects[0]
  const related = premiumProjects.filter((item) => item.id !== project.id).slice(0, 3)

  return (
    <>
      <SEO
        title={`${project.title} - case study`}
        description={`${project.title}: case study EuropaService per ${project.category}, ${project.city}, con cartongesso, finiture e gestione cantiere.`}
      />

      <PremiumHero
        eyebrow="Case study"
        title={project.title}
        text={project.longText ?? project.summary}
        image={project.image}
        imageAlt={project.alt}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Torna al portfolio"
        secondaryHref="#/cantieri"
        variant="detail"
        meta={[project.city, project.category, project.status, project.year]}
      />

      <PremiumSection eyebrow="Dati chiave" title="Il progetto in sintesi" text="Prima di parlare di estetica, un case study deve chiarire dimensione, durata, servizi coinvolti e risultato operativo.">
        <div className="premium-key-facts">
          <article><span>Superficie</span><strong>{project.metrics[0]}</strong></article>
          <article><span>Durata</span><strong>{project.metrics[1]}</strong></article>
          <article><span>Team / risultato</span><strong>{project.metrics[2]}</strong></article>
          <article><span>Anno</span><strong>{project.year}</strong></article>
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Sfida</p>
          <h2>{project.challenge}</h2>
          <p>Ogni cantiere ha un punto critico: tempi stretti, spazi da proteggere, interferenze tecniche, attività aperte o esigenze estetiche elevate.</p>
        </article>
        <article>
          <p className="premium-eyebrow">Soluzione</p>
          <h2>{project.solution}</h2>
          <p>La risposta è stata organizzare le fasi, ridurre passaggi inutili, documentare avanzamento e controllare i dettagli prima della consegna.</p>
        </article>
      </section>

      <PremiumSection eyebrow="Galleria" title="Immagini e materiali del progetto" tone="soft">
        <div className="premium-gallery">
          {[project.image, serviceImages.cartongesso.src, serviceImages.finitureInterne.src].map((src, index) => (
            <SafeImage
              alt={`${project.title} immagine ${index + 1}`}
              className="premium-gallery-image"
              fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
              key={`${src}-${index}`}
              src={src}
              title={`${project.title} galleria`}
            />
          ))}
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Metodo applicato"
        title="Il risultato finale dipende dalla qualità delle fasi intermedie."
        text="Abbiamo impostato il progetto per zone, lavorazioni e priorità. Questo ha permesso di ridurre interferenze, controllare i dettagli e mantenere una comunicazione chiara con tutti i soggetti coinvolti."
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
              text="Lavorazione integrata nel piano operativo con controlli intermedi, coordinamento e attenzione alla consegna finale."
            />
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Risultati" title="Cosa è stato ottenuto" tone="soft">
        <div className="premium-feature-grid">
          {project.results.map((result) => <PremiumTextCard key={result} title={result} text="Risultato concreto ottenuto grazie a pianificazione, presenza in cantiere e controllo delle fasi." />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Timeline" title="Processo di lavoro">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Cliente" title="Testimonianza" tone="soft">
        <div className="premium-testimonial-grid">
          <TestimonialMock testimonial={testimonials[0]} />
          <TestimonialMock testimonial={testimonials[1]} />
          <TestimonialMock testimonial={testimonials[2]} />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Altri progetti" title="Case study correlati">
        <div className="premium-project-grid">
          {related.map((item) => <PremiumProjectCard key={item.id} project={item} />)}
        </div>
      </PremiumSection>

      <PremiumCTA title="Vuoi un risultato simile?" text="Raccontaci il progetto, gli spazi e le priorità. Ti aiutiamo a impostare un cantiere ordinato." />
    </>
  )
}
