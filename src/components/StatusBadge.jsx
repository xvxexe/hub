import { getStatusTone } from '../lib/statusConfig'

export function StatusBadge({ children }) {
  return <span className={`status-badge status-${getStatusTone(children)}`}>{children}</span>
}
