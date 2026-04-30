import { CTASection, ProcessSteps } from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { StatusBadge } from '../../components/StatusBadge'
import { getPublicProjectById, publicProjects } from '../../data/publicProjects'

export function ProjectDetail({ projectId }) {
  const project = getPublicProjectById(projectId) ?? publicProjects[0]

  const defaultWork = [
    'Preparazione area',
    'Strutture in cartongesso',
    'Controsoffitti',
    'Rasature',
    'Finiture interne',
    'Controllo finale',
  ]

  return (
    <>
      <SEO title={`${project.title} - scheda cantiere`} description={project.seoDescription} />
      <section className="project-detail-hero">
        <div className="project-detail-copy">
          <p className="eyebrow">Scheda portfolio</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#/preventivo">Richiedi un lavoro simile</a>
            <a className="button button-secondary" href="#/cantieri">Guarda altri cantieri</a>
          </div>
        </div>
        <SafeImage
          alt={project.imageAlt}
          className="project-detail-image"
          fallbackSrc={project.fallbackImage}
          src={project.image}
          title={project.seoTitle}
        />
      </section>

      <section className="section">
        <div className="detail-layout project-detail-layout">
          <article className="info-card">
            <StatusBadge>{project.status}</StatusBadge>
            <h2>Informazioni principali</h2>
            <dl className="detail-list">
              <div><dt>Località</dt><dd>{project.location}</dd></div>
              <div><dt>Categoria</dt><dd>{project.type}</dd></div>
              <div><dt>Tipo cliente</dt><dd>{project.clientType}</dd></div>
              <div><dt>Anno</dt><dd>{project.year}</dd></div>
            </dl>
          </article>
          <article className="info-card">
            <h2>Obiettivo dell’intervento</h2>
            <p>
              {project.objective ??
                'L’intervento ha riguardato la realizzazione e sistemazione di lavorazioni interne con attenzione alla funzionalità degli spazi, alla pulizia delle finiture e all’integrazione con le esigenze del cantiere.'}
            </p>
          </article>
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <h2>Lavorazioni eseguite</h2>
          <p>Le informazioni sono pubbliche e non includono spese, documenti, contabilità o note interne.</p>
        </div>
        <div className="public-grid">
          {(project.services.length ? project.services : defaultWork).map((service) => (
            <article className="public-card" key={service}>
              <h3>{service}</h3>
              <p>Lavorazione gestita con attenzione a ordine, coordinamento e qualità della finitura.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Fasi del lavoro</h2>
          <p>Il progetto viene raccontato per fasi operative, così il cliente capisce metodo e risultato.</p>
        </div>
        <ProcessSteps
          steps={(project.phases ?? defaultWork.slice(0, 4)).map((phase, index) => ({
            step: String(index + 1).padStart(2, '0'),
            title: phase,
            text: 'Fase organizzata con controllo dell’avanzamento e attenzione alle lavorazioni successive.',
          }))}
        />
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <h2>Galleria immagini</h2>
          <p>Esempi visivi della tipologia di lavorazione e delle fasi pubblicabili del cantiere.</p>
        </div>
        <div className="public-gallery">
          {project.gallery.map((item) => (
            <figure className="public-gallery-item" key={item}>
              <SafeImage
                alt={`${item} - ${project.imageAlt}`}
                className="public-project-image"
                fallbackSrc={project.fallbackImage}
                src={project.image}
                title={`${project.title} - ${item}`}
              />
              <figcaption>{item}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section">
        <article className="public-card result-card">
          <p className="eyebrow">Risultato finale</p>
          <h2>Ambiente più ordinato, funzionale e pronto all’uso</h2>
          <p>
            {project.result} Il risultato finale è un ambiente più ordinato, funzionale e pronto
            per le successive fasi di utilizzo o consegna.
          </p>
        </article>
      </section>

      <CTASection
        title="Richiedi un lavoro simile"
        text="Raccontaci tipo di immobile, località, urgenza e allega eventuali foto: la richiesta verrà raccolta in modalità dimostrativa."
      />
    </>
  )
}
