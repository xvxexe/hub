import { StatusBadge } from './StatusBadge'
import { InternalIcon } from './InternalIcons'

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

export function StatCard({ label, value, hint, icon = 'building', tone = 'blue' }) {
  return (
    <article className={`stat-card internal-stat-card stat-tone-${tone}`}>
      <span className="stat-icon"><InternalIcon name={icon} size={22} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
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

export function QuickActionCard({ title, text, href, action = 'Apri', icon = 'plus', onClick }) {
  const content = (
    <>
      <span className="quick-action-icon"><InternalIcon name={icon} size={22} /></span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <span>{action}</span>
    </>
  )

  if (onClick) {
    return (
      <button className="quick-action-card" type="button" onClick={onClick}>
        {content}
      </button>
    )
  }

  return (
    <a className="quick-action-card" href={href}>
      {content}
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

export function MockActionModal({ action, onClose }) {
  if (!action) return null

  return (
    <div className="mock-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="mock-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="mock-modal-close" type="button" aria-label="Chiudi" onClick={onClose}>×</button>
        <span className="mock-modal-icon"><InternalIcon name={action.icon ?? 'check'} size={22} /></span>
        <h2>{action.title}</h2>
        <p>{action.text}</p>
        {action.fields ? (
          <div className="mock-modal-fields">
            {action.fields.map((field) => (
              <label key={field.label}>
                {field.label}
                {field.type === 'select' ? (
                  <select defaultValue={field.options?.[0] ?? ''}>
                    {field.options?.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : (
                  <input placeholder={field.placeholder} type={field.type ?? 'text'} />
                )}
              </label>
            ))}
          </div>
        ) : null}
        <div className="mock-modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>Annulla</button>
          <button className="button button-primary" type="button" onClick={onClose}>{action.confirmLabel ?? 'Conferma mock'}</button>
        </div>
      </section>
    </div>
  )
}

export function MockActionButton({ children, action, onAction, className = 'button button-secondary', icon }) {
  return (
    <button className={className} type="button" onClick={() => onAction(action)}>
      {icon ? <InternalIcon name={icon} size={17} /> : null}
      {children}
    </button>
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
