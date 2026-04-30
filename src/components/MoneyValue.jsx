import { formatCurrency } from '../data/mockCantieri'

export function MoneyValue({ value }) {
  return <span className="money-value">{formatCurrency(value)}</span>
}
