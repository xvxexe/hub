import { StatusBadge } from './StatusBadge'
import { SafeImage } from './SafeImage'

export function HeroSection({ eyebrow, title, text, image, trustItems = [], children }) {
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
        {trustItems.length > 0 ? (
          <div className="hero-trust-list">
            {trustItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        ) : null}
      </div>
      <div className="hero-media">
        {image ? (
          <SafeImage
            alt={image.alt}
            className="public-hero-image"
            fallbackSrc="/assets/images/placeholders/hero-edilizia-cartongesso.svg"
            loading="eager"
            src={image.src}
            title={image.title}
          />
        ) : null}
        {children}
      </div>
    </section>
  )
}

export function ServiceCard({ service }) {
  return (
    <article className="public-card service-card">
      <SafeImage
        alt={service.imageAlt}
        className="public-card-image"
        fallbackSrc={service.fallbackImage}
        src={service.image}
        title={service.seoTitle}
      />
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
      <SafeImage
        alt={project.imageAlt}
        className="public-project-image"
        fallbackSrc={project.fallbackImage}
        src={project.image}
        title={project.seoTitle}
      />
      <div className="project-public-body">
        <StatusBadge>{project.status}</StatusBadge>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <small>{project.type} · {project.location} · {project.year}</small>
        {project.clientType ? <small>Cliente: {project.clientType}</small> : null}
        <div className="tag-list">
          {project.services.map((service) => <span key={service}>{service}</span>)}
        </div>
        <a className="button button-secondary" href={`#/cantieri/${project.id}`}>Vedi progetto</a>
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
      <SafeImage
        alt={sector.imageAlt}
        className="public-card-image"
        fallbackSrc={sector.fallbackImage}
        src={sector.image}
        title={sector.seoTitle}
      />
      <h2>{sector.title}</h2>
      <p>{sector.text}</p>
      {sector.needs ? (
        <ul className="clean-list">
          {sector.needs.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
    </article>
  )
}

export function FAQ({ items }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <article className="public-card" key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </article>
      ))}
    </div>
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
