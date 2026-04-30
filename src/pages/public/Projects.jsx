import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { publicProjects } from '../../data/mockData'

export function Projects() {
  return (
    <>
      <PageHeader eyebrow="Cantieri" title="Lavori realizzati e casi dimostrativi">
        Archivio pubblico mock per presentare tipologie di intervento e risultati.
      </PageHeader>
      <section className="section">
        <div className="card-grid">
          {publicProjects.map((project) => (
            <article className="info-card project-card" key={project.id}>
              <StatusBadge>{project.status}</StatusBadge>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
              <small>{project.type} · {project.location} · {project.year}</small>
              <a className="text-link" href={`#/cantieri/${project.id}`}>
                Apri dettaglio
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
