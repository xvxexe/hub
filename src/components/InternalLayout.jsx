import { InternalIcon } from './InternalIcons'
import { StatusBadge } from './StatusBadge'

export function PageActions({ children }) {
  if (!children) return null
  return <div className="internal-page-actions">{children}</div>
}

export function CommandPanel({ eyebrow, title, description, children, aside, className = '' }) {
  return (
    <section className={`internal-command-panel ${className}`.trim()}>
      <div className="internal-command-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        {title ? <h2>{title}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>
      {children ? <div className="internal-command-body">{children}</div> : null}
      {aside ? <div className="internal-command-aside">{aside}</div> : null}
    </section>
  )
}

export function FilterGrid({ children, className = '', ariaLabel = 'Filtri pagina' }) {
  return (
    <section className={`internal-filter-grid ${className}`.trim()} aria-label={ariaLabel}>
      {children}
    </section>
  )
}

export function KpiStrip({ children, className = '', ariaLabel = 'Indicatori principali' }) {
  return (
    <section className={`internal-kpi-strip ${className}`.trim()} aria-label={ariaLabel}>
      {children}
    </section>
  )
}

export function KpiCard({ icon = 'report', label, value, hint, tone = 'blue', muted = false }) {
  return (
    <article className={`internal-kpi-card internal-kpi-${tone} ${muted ? 'is-muted' : ''}`.trim()}>
      <span className="internal-kpi-icon"><InternalIcon name={icon} size={17} /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        {hint ? <em>{hint}</em> : null}
      </div>
    </article>
  )
}

export function WorkspaceLayout({ children, sidebar, className = '' }) {
  return (
    <div className={`internal-workspace-layout ${className}`.trim()}>
      <main className="internal-workspace-main">{children}</main>
      {sidebar ? <aside className="internal-workspace-sidebar">{sidebar}</aside> : null}
    </div>
  )
}

export function SideContextPanel({ title, description, action, children, className = '' }) {
  return (
    <section className={`internal-panel internal-side-context ${className}`.trim()}>
      <div className="section-heading panel-title-row">
        <div>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        {action ?? null}
      </div>
      {children}
    </section>
  )
}

export function DataCardRow({
  title,
  description,
  meta = [],
  status,
  href,
  action,
  icon,
  selected = false,
  warning = false,
  children,
  className = '',
  onClick,
}) {
  const rowClassName = [
    'internal-data-card-row',
    selected ? 'selected' : '',
    warning ? 'is-warning' : '',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {icon ? <span className="internal-data-card-icon"><InternalIcon name={icon} size={18} /></span> : null}
      <div className="internal-data-card-main">
        <div className="internal-data-card-titleline">
          <strong>{title}</strong>
          {status ? <StatusBadge>{status}</StatusBadge> : null}
        </div>
        {description ? <p>{description}</p> : null}
        {meta.length ? (
          <dl className="internal-data-card-meta">
            {meta.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
      {action ? <div className="internal-data-card-action">{action}</div> : null}
    </>
  )

  if (href) {
    return <a className={rowClassName} href={href}>{content}</a>
  }

  if (onClick) {
    return <button className={rowClassName} type="button" onClick={onClick}>{content}</button>
  }

  return <article className={rowClassName}>{content}</article>
}

export function ActionList({ children, className = '' }) {
  return <div className={`internal-action-list ${className}`.trim()}>{children}</div>
}

export function MobileActionMenu({ label = 'Azioni', children }) {
  return (
    <details className="internal-mobile-action-menu">
      <summary>{label}</summary>
      <div>{children}</div>
    </details>
  )
}
