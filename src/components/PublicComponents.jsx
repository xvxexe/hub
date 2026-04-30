import { StatusBadge } from './StatusBadge'

export function HeroSection({ eyebrow, title, text, children }) {
  return (
    <section className="hero-section public-hero">
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
          <a className="button button-secondary" href="#/cantieri">Guarda i cantieri</a>
        </div>
      </div>
      {children}
    </section>
  )
}

export function ServiceCard({ service }) {
  return (
    <article className="public-card service-card">
      <span className="service-icon">{service.icon}</span>
      <h2>{service.title}</h2>
      <p>{service.description}</p>
      <ul className="clean-list">
        {service.strengths.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <a className="text-link" href="#/preventivo">Richiedi preventivo</a>
    </article>
  )
}

export function ProjectCard({ project }) {
  return (
    <article className="public-card project-public-card">
      <div className="public-image-placeholder"><span>{project.imageLabel}</span></div>
      <div className="project-public-body">
        <StatusBadge>{project.status}</StatusBadge>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <small>{project.type} · {project.location} · {project.year}</small>
        <div className="tag-list">
          {project.services.map((service) => <span key={service}>{service}</span>)}
        </div>
        <a className="button button-secondary" href={`#/cantieri/${project.id}`}>Vedi dettaglio</a>
      </div>
    </article>
  )
}

export function CTASection({ title = 'Hai un lavoro simile da organizzare?', text }) {
  return (
    <section className="public-cta">
      <div>
        <p className="eyebrow">Preventivo</p>
        <h2>{title}</h2>
        <p>{text ?? 'Raccontaci il cantiere: ti risponderemo con una prima valutazione mock chiara e ordinata.'}</p>
      </div>
      <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
    </section>
  )
}

export function StatsBand({ stats }) {
  return (
    <section className="stats-band">
      {stats.map((stat) => (
        <article key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </article>
      ))}
    </section>
  )
}

export function ProcessSteps({ steps }) {
  return (
    <div className="process-grid">
      {steps.map((step) => (
        <article className="public-card" key={step.step}>
          <span className="step-number">{step.step}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </article>
      ))}
    </div>
  )
}

export function SectorCard({ sector }) {
  return (
    <article className="public-card sector-card">
      <h2>{sector.title}</h2>
      <p>{sector.text}</p>
    </article>
  )
}

export function TestimonialMock({ testimonial }) {
  return (
    <article className="public-card testimonial-card">
      <p>“{testimonial.quote}”</p>
      <strong>{testimonial.author}</strong>
    </article>
  )
}
