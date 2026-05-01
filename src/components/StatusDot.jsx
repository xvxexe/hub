import { getStatusTone } from '../lib/statusConfig'

export function StatusDot({ status, label, className = '' }) {
  const text = label || status || 'Stato'
  return (
    <span
      className={`status-dot status-dot-${getStatusTone(text)} ${className}`.trim()}
      aria-label={`Stato: ${text}`}
      title={text}
    >
      <span aria-hidden="true" />
      <small>{text}</small>
    </span>
  )
}
