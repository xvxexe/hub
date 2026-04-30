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
        {items.map((item) => (
          <article className="activity-item" key={`${item.title}-${item.meta}`}>
            <span />
            <div>
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </div>
            {item.status ? <StatusBadge>{item.status}</StatusBadge> : null}
          </article>
        ))}
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
