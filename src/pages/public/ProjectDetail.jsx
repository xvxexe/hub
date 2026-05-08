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
import { testimonials, workMethod } from '../../data/publicPremiumData'
import { realPublicProjects } from '../../data/publicRealData'
import { serviceImages } from '../../data/publicImages'

export function ProjectDetail({ projectId }) {
  const project = realPublicProjects.find((item) => item.id === projectId) ?? realPublicProjects[0]
  const related = realPublicProjects.filter((item) => item.id !== project.id).slice(0, 3)

  return (
    <>
      <SEO
        title={`${project.title} - case study`}
        description={`${project.title}: case study EuropaService per ${project.category}, ${project.city}, con dati collegati all’area privata e immagini generiche provvisorie.`}
      />

      <PremiumHero
        eyebrow="Case study reale"
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

      <PremiumSection eyebrow="Dati chiave" title="Il progetto in sintesi" text="Questi dati derivano dalla parte privata: tab di lavorazione, movimenti e riepilogo operativo. Le foto sono ancora generiche finché non vengono approvate immagini pubblicabili.">
        <div className="premium-key-facts">
          <article><span>Dato 1</span><strong>{project.metrics[0]}</strong></article>
          <article><span>Dato 2</span><strong>{project.metrics[1]}</strong></article>
          <article><span>Dato 3</span><strong>{project.metrics[2]}</strong></article>
          <article><span>Anno</span><strong>{project.year}</strong></article>
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Sfida</p>
          <h2>{project.challenge}</h2>
          <p>Ogni cantiere ha un punto critico: dati dispersi, lavorazioni sovrapposte, documenti da collegare e fasi da rendere leggibili anche fuori dall’area privata.</p>
        </article>
        <article>
          <p className="premium-eyebrow">Soluzione</p>
          <h2>{project.solution}</h2>
          <p>La risposta è usare i dati interni come base pubblica controllata: schede sintetiche, foto generiche e informazioni operative senza esporre tutta la contabilità.</p>
        </article>
      </section>

      <PremiumSection eyebrow="Galleria" title="Immagini provvisorie del progetto" tone="soft">
        <div className="premium-gallery">
          {[project.image, serviceImages.cartongesso.src, serviceImages.finitureInterne.src].map((src, index) => (
            <SafeImage
              alt={`${project.title} immagine generica ${index + 1}`}
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
        title="Il racconto pubblico parte dal sistema interno."
        text="Le lavorazioni vengono lette per tab, importi e categorie. Questo permette di trasformare il cantiere in schede semplici da capire, senza pubblicare dati sensibili o immagini non validate."
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
              text="Lavorazione collegata al cantiere e riportata in modo sintetico per uso pubblico."
            />
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Risultati" title="Cosa è stato ottenuto" tone="soft">
        <div className="premium-feature-grid">
          {project.results.map((result) => <PremiumTextCard key={result} title={result} text="Risultato operativo ottenuto grazie a classificazione, ordine dei tab e collegamento con il master interno." />)}
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
