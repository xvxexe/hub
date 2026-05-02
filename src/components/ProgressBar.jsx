export function ProgressBar({ value, showLabel = true }) {
  return (
    <div className="progress-block" aria-label={`Avanzamento ${value}%`}>
      {showLabel ? (
        <div className="progress-label">
          <span>Avanzamento</span>
          <strong>{value}%</strong>
        </div>
      ) : null}
      <div className="progress-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
