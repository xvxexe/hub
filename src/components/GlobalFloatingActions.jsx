import { useState } from 'react'
import { InternalIcon } from './InternalIcons'

export function GlobalFloatingActions({ role }) {
  const [isOpen, setIsOpen] = useState(false)
  const actions = getActionsForRole(role)

  return (
    <div className={isOpen ? 'floating-actions global-floating-actions open' : 'floating-actions global-floating-actions'}>
      {isOpen ? <button aria-label="Chiudi azioni rapide" className="floating-actions-backdrop" type="button" onClick={() => setIsOpen(false)} /> : null}
      <div className="floating-actions-menu" aria-hidden={!isOpen}>
        <strong>Azioni rapide</strong>
        <div>
          {actions.map((item) => (
            <a href={item.href} key={item.label} onClick={() => setIsOpen(false)}>
              <InternalIcon name={item.icon} size={18} />
              <span><b>{item.label}</b><small>{item.hint}</small></span>
            </a>
          ))}
        </div>
      </div>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Chiudi azioni rapide' : 'Apri azioni rapide'}
        className="floating-actions-trigger"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <InternalIcon name={isOpen ? 'check' : 'plus'} size={22} />
      </button>
    </div>
  )
}

function getActionsForRole(role) {
  if (role === 'employee') {
    return [
      { icon: 'upload', label: 'Carica foto/documento', hint: 'Apri upload', href: '#/dashboard/upload' },
      { icon: 'inbox', label: 'I miei caricamenti', hint: 'Controlla invii', href: '#/dashboard/caricamenti' },
    ]
  }

  return [
    { icon: 'upload', label: 'Carica documento', hint: 'Apri upload', href: '#/dashboard/upload' },
    { icon: 'file', label: 'Documenti', hint: 'Da controllare', href: '#/dashboard/documenti' },
    { icon: 'building', label: 'Cantieri', hint: 'Gestisci lavori', href: '#/dashboard/cantieri' },
    { icon: 'wallet', label: 'Contabilità', hint: 'Spese e pagamenti', href: '#/dashboard/contabilita' },
    { icon: 'report', label: 'Report', hint: 'Riepilogo operativo', href: '#/dashboard/report' },
  ]
}
