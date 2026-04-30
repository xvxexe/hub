import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { publicProjects } from '../../data/mockData'

export function ProjectDetail({ projectId }) {
  const project = publicProjects.find((item) => item.id === projectId) ?? publicProjects[0]

  return (
    <>
      <PageHeader eyebrow="Dettaglio cantiere" title={project.title}>
        {project.summary}
      </PageHeader>
      <section className="section">
        <div className="detail-layout">
          <div className="mock-photo-block">
            <span>Foto mock</span>
          </div>
          <div className="info-card">
            <StatusBadge>{project.status}</StatusBadge>
            <dl className="detail-list">
              <div>
                <dt>Tipologia</dt>
                <dd>{project.type}</dd>
              </div>
              <div>
                <dt>Zona</dt>
                <dd>{project.location}</dd>
              </div>
              <div>
                <dt>Anno</dt>
                <dd>{project.year}</dd>
              </div>
            </dl>
            <a className="button button-secondary" href="#/cantieri">
              Torna ai cantieri
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
