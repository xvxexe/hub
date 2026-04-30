export function PageHeader({ eyebrow, title, children }) {
  return (
    <section className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
    </section>
  )
}
