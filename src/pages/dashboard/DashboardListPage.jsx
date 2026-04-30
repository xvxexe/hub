import { StatusBadge } from '../../components/StatusBadge'

export function DashboardListPage({ eyebrow, title, description, rows, columns }) {
  return (
    <>
      <section className="dashboard-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="table-card">
        {rows.map((row, index) => (
          <article className="data-row" key={`${title}-${index}`}>
            {columns.map((column) => {
              const value = row[column.key]
              return (
                <div key={column.key}>
                  <small>{column.label}</small>
                  {column.badge ? <StatusBadge>{value}</StatusBadge> : <strong>{value}</strong>}
                </div>
              )
            })}
          </article>
        ))}
      </section>
    </>
  )
}
