export function ProgressBar({ value }) {
  return (
    <div className="progress-block" aria-label={`Avanzamento ${value}%`}>
      <div className="progress-label">
        <span>Avanzamento</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
