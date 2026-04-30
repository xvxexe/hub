import { CTASection } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { getPublicProjectById, publicProjects } from '../../data/mockPublicProjects'

export function ProjectDetail({ projectId }) {
  const project = getPublicProjectById(projectId) ?? publicProjects[0]

  return (
    <>
      <PageHeader eyebrow="Dettaglio cantiere pubblico" title={project.title}>
        {project.description}
      </PageHeader>
      <section className="section">
        <div className="detail-layout">
          <div className="public-gallery">
            {project.gallery.map((item) => (
              <div className="public-image-placeholder" key={item}><span>{item}</span></div>
            ))}
          </div>
          <article className="info-card">
            <StatusBadge>{project.status}</StatusBadge>
            <dl className="detail-list">
              <div><dt>Località</dt><dd>{project.location}</dd></div>
              <div><dt>Tipo intervento</dt><dd>{project.type}</dd></div>
              <div><dt>Anno</dt><dd>{project.year}</dd></div>
            </dl>
            <h2>Lavorazioni eseguite</h2>
            <ul className="clean-list">
              {project.services.map((service) => <li key={service}>{service}</li>)}
            </ul>
            <h2>Risultato ottenuto</h2>
            <p>{project.result}</p>
          </article>
        </div>
      </section>
      <CTASection title="Richiedi un lavoro simile" text="Raccontaci tipo di immobile, città e priorità: nessun invio reale, solo demo mock." />
    </>
  )
}
