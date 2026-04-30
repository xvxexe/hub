import { PageHeader } from '../../components/PageHeader'
import { Section } from '../../components/Section'
import { company, publicProjects, services } from '../../data/mockData'

export function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Impresa edile e cartongesso</p>
          <h1>Gestione cantieri ordinata, lavori puliti, comunicazione chiara.</h1>
          <p>
            {company.name} presenta i servizi al cliente e prepara una base interna per
            controllare cantieri, documenti, foto e preventivi con dati mock.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#/preventivo">
              Richiedi preventivo
            </a>
            <a className="button button-secondary" href="#/cantieri">
              Vedi cantieri
            </a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Sintesi operativa">
          <span>v0.1 mock frontend</span>
          <strong>6 cantieri monitorati</strong>
          <p>Base pronta per espandere ruoli, documenti, foto e contabilità nelle prossime fasi.</p>
        </div>
      </section>

      <Section
        title="Servizi principali"
        intro="Una presentazione essenziale per clienti privati, studi tecnici e attività commerciali."
      >
        <div className="card-grid">
          {services.map((service) => (
            <article className="info-card" key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Cantieri in evidenza" tone="muted">
        <div className="project-list">
          {publicProjects.slice(0, 2).map((project) => (
            <a className="project-row" href={`#/cantieri/${project.id}`} key={project.id}>
              <span>{project.type}</span>
              <strong>{project.title}</strong>
              <small>{project.location} · {project.year}</small>
            </a>
          ))}
        </div>
      </Section>

      <PageHeader eyebrow="Area interna" title="Dashboard mock pronta per la fase v0.1">
        Navigazione interna disponibile da Area interna, con dati dimostrativi e senza servizi reali.
      </PageHeader>
    </>
  )
}
