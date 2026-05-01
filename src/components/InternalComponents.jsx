import { StatusBadge } from './StatusBadge'

export function DashboardHeader({ eyebrow, title, description, roleLabel, children }) {
  return (
    <section className="dashboard-header internal-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="internal-header-side">
        {roleLabel ? <span className="role-pill role-pill-light">{roleLabel}</span> : null}
        {children}
      </div>
    </section>
  )
}

export function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card internal-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  )
}

export function ActivityFeed({ title, items }) {
  return (
    <section className="internal-panel">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="activity-feed">
        {items.length > 0 ? items.map((item) => (
          <InteractiveActivityItem item={item} key={`${item.title}-${item.meta}`} />
        )) : <p>Nessuna attività nei dati mock correnti.</p>}
      </div>
    </section>
  )
}

export function WorkflowStepper({ title, steps }) {
  return (
    <section className="internal-panel">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="workflow-stepper">
        {steps.map((step, index) => (
          <article className="workflow-step" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

export function DataModeBadge({ children = 'Dati mock locali' }) {
  return <span className="data-mode-badge">{children}</span>
}

export function QuickActionCard({ title, text, href, action = 'Apri' }) {
  return (
    <a className="quick-action-card" href={href}>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <span>{action}</span>
    </a>
  )
}

export function AlertPanel({ title = 'Alert operativi', alerts }) {
  return (
    <section className="internal-panel alert-panel">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="activity-feed">
        {alerts.length > 0 ? alerts.map((alert) => (
          <InteractiveActivityItem alert item={alert} key={alert.id ?? `${alert.title}-${alert.meta}`} />
        )) : <p>Nessun alert aperto nei dati mock correnti.</p>}
      </div>
    </section>
  )
}

function InteractiveActivityItem({ item, alert = false }) {
  const className = alert ? 'activity-item alert-item interactive-row' : 'activity-item interactive-row'
  const content = (
    <>
      <span />
      <div>
        <strong>{item.title}</strong>
        <small>{item.meta}</small>
      </div>
      {item.status ? <StatusBadge>{item.status}</StatusBadge> : null}
    </>
  )

  if (item.href) {
    return (
      <a className={className} href={item.href}>
        {content}
      </a>
    )
  }

  return <article className={className}>{content}</article>
}
