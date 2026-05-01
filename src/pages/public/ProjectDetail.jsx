import {
  PremiumCTA,
  PremiumHero,
  PremiumProcess,
  PremiumProjectCard,
  PremiumSection,
  TestimonialMock,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { premiumProjects, testimonials, workMethod } from '../../data/publicPremiumData'

export function ProjectDetail({ projectId }) {
  const project = premiumProjects.find((item) => item.id === projectId) ?? premiumProjects[0]
  const related = premiumProjects.filter((item) => item.id !== project.id).slice(0, 3)

  return (
    <>
      <SEO
        title={`${project.title} - case study`}
        description={`${project.title}: case study EuropaService per ${project.category}, ${project.city}, con servizi di cartongesso, finiture e gestione cantiere.`}
      />

      <PremiumHero
        eyebrow="Case study"
        title={project.title}
        text={project.summary}
        image={project.image}
        imageAlt={project.alt}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Torna al portfolio"
        secondaryHref="#/cantieri"
        variant="detail"
        meta={[project.city, project.category, project.status, project.year]}
      />

      <PremiumSection eyebrow="Dati chiave" title="Il progetto in sintesi">
        <div className="premium-key-facts">
          <article><span>Superficie</span><strong>{project.metrics[0]}</strong></article>
          <article><span>Durata</span><strong>{project.metrics[1]}</strong></article>
          <article><span>Servizi</span><strong>{project.services.join(', ')}</strong></article>
          <article><span>Team</span><strong>{project.metrics[2]}</strong></article>
          <article><span>Anno</span><strong>{project.year}</strong></article>
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Sfida</p>
          <h2>Coordinare lavorazioni tecniche senza perdere qualità visiva.</h2>
          <p>
            Il progetto richiedeva gestione di tempi, accessi, interferenze impiantistiche e finiture
            con standard elevato. La priorità era mantenere avanzamento e controllo dei dettagli.
          </p>
        </article>
        <article>
          <p className="premium-eyebrow">Soluzione</p>
          <h2>Una sequenza ordinata di fasi, verifiche e consegne intermedie.</h2>
          <p>
            EuropaService ha impostato squadre, materiali e lavorazioni per zone, documentando le fasi
            e mantenendo un referente operativo per decisioni rapide e tracciabili.
          </p>
        </article>
      </section>

      <PremiumSection eyebrow="Galleria" title="Immagini del cantiere" tone="soft">
        <div className="premium-gallery">
          {[project.image, '/assets/images/hero/controsoffitto-cantiere-interno.jpg', '/assets/images/projects/cantiere-controsoffitto.jpg'].map((src, index) => (
            <SafeImage
              alt={`${project.title} immagine ${index + 1}`}
              className="premium-gallery-image"
              fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
              key={src}
              src={src}
              title={`${project.title} galleria`}
            />
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Servizi realizzati" title="Lavorazioni coinvolte">
        <div className="premium-feature-grid">
          {project.services.map((service) => (
            <article className="premium-card" key={service}>
              <h3>{service}</h3>
              <p>Lavorazione integrata nel piano operativo con controlli intermedi e attenzione alla consegna finale.</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Risultati" title="Cosa è stato ottenuto" tone="soft">
        <div className="premium-result-band">
          {project.metrics.map((metric) => <strong key={metric}>{metric}</strong>)}
          <p>{project.summary}</p>
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Timeline" title="Processo di lavoro">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Cliente" title="Testimonianza" tone="soft">
        <div className="premium-testimonial-grid">
          <TestimonialMock testimonial={testimonials[0]} />
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
