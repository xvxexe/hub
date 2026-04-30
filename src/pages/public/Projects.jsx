import { useMemo, useState } from 'react'
import { ProjectCard } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { SEO } from '../../components/SEO'
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
      <SEO
        title="Cantieri e portfolio lavori"
        description="Portfolio EuropaService con esempi di cantieri organizzati, cartongesso, controsoffitti, finiture interne e lavori edili per hotel, privati, negozi e aziende."
      />
      <PageHeader eyebrow="Cantieri EuropaService" title="Cantieri organizzati, lavorazioni interne e portfolio lavori">
        Ogni cantiere racconta un metodo di lavoro: organizzazione, attenzione ai dettagli,
        documentazione delle fasi e cura del risultato finale. In questa sezione raccogliamo
        esempi di lavorazioni interne, cartongesso, controsoffitti, finiture e interventi edili.
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
        <a className="button button-primary section-action" href="#/preventivo">Richiedi un lavoro simile</a>
      </section>
    </>
  )
}
