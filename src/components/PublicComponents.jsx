import { SafeImage } from './SafeImage'

export function PremiumHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  primaryLabel = 'Richiedi preventivo',
  primaryHref = '#/preventivo',
  secondaryLabel = 'Scopri i servizi',
  secondaryHref = '#/servizi',
  meta = [],
  variant = 'default',
}) {
  return (
    <section className={`premium-hero premium-hero-${variant}`}>
      <SafeImage
        alt={imageAlt || title}
        className="premium-hero-bg"
        fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
        loading="eager"
        src={image}
        title={title}
      />
      <div className="premium-hero-overlay-layer" />
      <div className="premium-hero-copy">
        {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
        <div className="premium-actions">
          <a className="premium-button premium-button-primary" href={primaryHref}>{primaryLabel}</a>
          <a className="premium-button premium-button-secondary" href={secondaryHref}>{secondaryLabel}</a>
        </div>
        {meta.length > 0 ? (
          <div className="premium-hero-meta">
            {meta.map((item) => <span key={item}>{item}</span>)}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function PremiumSection({ eyebrow, title, text, children, tone = 'default', action }) {
  return (
    <section className={`premium-section premium-section-${tone}`}>
      <div className="premium-section-heading">
        {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
        {action ? <div className="premium-section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function PremiumStats({ stats }) {
  return (
    <div className="premium-stats">
      {stats.map((stat) => (
        <article key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </article>
      ))}
    </div>
  )
}

export function PremiumServiceCard({ service, detailed = false }) {
  return (
    <article className={detailed ? 'premium-card premium-service-card premium-service-card-detailed' : 'premium-card premium-service-card'}>
      {service.image ? (
        <SafeImage
          alt={service.alt}
          className="premium-service-image"
          fallbackSrc="/assets/images/placeholders/placeholder-servizio.jpg"
          src={service.image}
          title={service.title}
        />
      ) : null}
      <div className="premium-service-copy">
        <PublicIcon name={service.icon ?? service.id} />
        <h3>{service.title}</h3>
        <p>{service.summary}</p>
        {service.benefits?.length ? (
          <ul className="premium-check-list">
            {service.benefits.slice(0, 3).map((benefit) => <li key={benefit}>{benefit}</li>)}
          </ul>
        ) : null}
        {service.deliverables?.length ? (
          <div className="premium-tags">
            {service.deliverables.slice(0, 4).map((item) => <small key={item}>{item}</small>)}
          </div>
        ) : null}
        <a className="premium-card-arrow" aria-label={`Richiedi informazioni su ${service.title}`} href="#/preventivo">→</a>
      </div>
    </article>
  )
}

export function PremiumProjectCard({ project, featured = false }) {
  return (
    <article className={featured ? 'premium-project-card premium-project-featured' : 'premium-project-card'}>
      <SafeImage
        alt={project.alt}
        className="premium-project-image"
        fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
        src={project.image}
        title={project.title}
      />
      <div className="premium-project-body">
        <span>{project.city} · {project.category}</span>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="premium-tags">
          {project.services.slice(0, 3).map((service) => <small key={service}>{service}</small>)}
        </div>
        <a className="premium-button premium-button-secondary" href={`#/cantieri/${project.id}`}>Vedi case study</a>
      </div>
    </article>
  )
}

export function PremiumProcess({ steps }) {
  return (
    <div className="premium-process">
      {steps.map((step) => (
        <article key={step.step}>
          <span>{step.step}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </article>
      ))}
    </div>
  )
}

export function PremiumCTA({ title = 'Parliamo del tuo progetto', text = 'Raccontaci spazi, tempi e priorità. Ti aiutiamo a trasformare l’idea in un cantiere organizzato.' }) {
  return (
    <section className="premium-final-cta">
      <div>
        <p className="premium-eyebrow">Prossimo passo</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="premium-actions">
        <a className="premium-button premium-button-primary" href="#/preventivo">Richiedi preventivo</a>
        <a className="premium-button premium-button-secondary" href="#/contatti">Parla con noi</a>
      </div>
    </section>
  )
}

export function PremiumFAQ({ items }) {
  return (
    <div className="premium-faq">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function TestimonialMock({ testimonial }) {
  return (
    <article className="premium-card premium-testimonial">
      <p>“{testimonial.quote}”</p>
      <strong>{testimonial.author}</strong>
      {testimonial.role ? <span>{testimonial.role}</span> : null}
    </article>
  )
}

export function PremiumTextCard({ title, text, eyebrow, items = [] }) {
  return (
    <article className="premium-card premium-text-card">
      {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
      <h3>{title}</h3>
      <p>{text}</p>
      {items.length ? (
        <ul className="premium-check-list">
          {items.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
    </article>
  )
}

export function PremiumImageSplit({ eyebrow, title, text, image, imageAlt, reverse = false, children }) {
  return (
    <section className={reverse ? 'premium-image-split premium-image-split-reverse' : 'premium-image-split'}>
      <SafeImage
        alt={imageAlt || title}
        className="premium-split-image"
        fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
        src={image}
        title={title}
      />
      <div className="premium-split-copy">
        {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <p>{text}</p>
        {children}
      </div>
    </section>
  )
}

export function PremiumTimeline({ items }) {
  return (
    <div className="premium-timeline">
      {items.map((item) => (
        <article key={item.title}>
          <span>{item.step}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function PublicIcon({ name }) {
  const paths = {
    cartongesso: <><path d="M4 9h16" /><path d="M4 15h16" /><path d="M8 5v14" /><path d="M16 5v14" /></>,
    'ristrutturazioni-tecniche': <><path d="M4 20h16" /><path d="M7 20V8l5-4 5 4v12" /><path d="M10 20v-6h4v6" /></>,
    'finiture-interne': <><path d="M5 19h14" /><path d="M7 19V9l5-5 5 5v10" /><path d="M9 13h6" /></>,
    'gestione-cantiere': <><path d="M4 20h16" /><path d="M6 20V8h6v12" /><path d="M12 20V5h6v15" /><path d="M8 11h2M8 14h2M14 9h2M14 12h2" /></>,
    manutenzioni: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4" /><path d="m15 5 4 4" /></>,
    'supporto-operativo': <><path d="M12 3 4 7v6c0 5 3.4 7.6 8 9 4.6-1.4 8-4 8-9V7l-8-4Z" /><path d="m9 12 2 2 4-5" /></>,
  }

  return (
    <span className="premium-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths[name] ?? paths.cartongesso}
      </svg>
    </span>
  )
}
