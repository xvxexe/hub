export function Section({ title, intro, children, tone = 'default' }) {
  return (
    <section className={`section section-${tone}`}>
      <div className="section-heading">
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </section>
  )
}
