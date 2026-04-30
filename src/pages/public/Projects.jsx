import { useMemo, useState } from 'react'
import { ProjectCard } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { projectStatuses, projectTypes, publicProjects } from '../../data/publicProjects'

export function Projects() {
  const [type, setType] = useState('Tutti')
  const [status, setStatus] = useState('Tutti')

  const filteredProjects = useMemo(
    () =>
      publicProjects.filter((project) => {
        const matchesType = type === 'Tutti' || project.type === type
        const matchesStatus = status === 'Tutti' || project.status === status
        return matchesType && matchesStatus
      }),
    [status, type],
  )

  return (
    <>
      <PageHeader eyebrow="Cantieri EuropaService" title="Portfolio lavori e cantieri mock">
        Cantieri in evidenza per hotel, residenze, negozi e condomini. Le schede mostrano solo dati pubblicabili.
      </PageHeader>
      <section className="public-filter-bar">
        <label>
          Tipo lavoro
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Stato
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {projectStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>
      <section className="section">
        <div className="public-project-grid">
          {filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>
    </>
  )
}
