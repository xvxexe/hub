import { useMemo, useState } from 'react'
import { StatusBadge } from './StatusBadge'

export function CantiereDeleteGuard({ cantiereId, session, store }) {
  const [status, setStatus] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const cantiere = store?.cantieri?.find((item) => item.id === cantiereId)
  const dependencies = useMemo(() => {
    if (!store?.getCantiereDependencies) {
      return { documents: [], movements: [], photos: [], estimates: [] }
    }
    return store.getCantiereDependencies(cantiereId)
  }, [store, cantiereId])

  if (session?.role !== 'admin' || !cantiere) return null

  const hasDependencies = Boolean(
    dependencies.documents.length
      || dependencies.movements.length
      || dependencies.photos.length
      || dependencies.estimates.length,
  )

  async function deleteCantiere() {
    if (!store?.deleteCantiere) {
      setStatus({ type: 'error', message: 'Eliminazione cantiere non disponibile nello store operativo.' })
      return
    }

    const confirmed = window.confirm(`Eliminare definitivamente la bozza cantiere "${cantiere.nome}"?`)
    if (!confirmed) return

    setIsDeleting(true)
    const result = await store.deleteCantiere(cantiere.id)
    setIsDeleting(false)

    if (!result?.ok) {
      setStatus({ type: 'error', message: result?.error ?? 'Eliminazione non riuscita.' })
      return
    }

    window.location.assign('#/dashboard/cantieri')
  }

  return (
    <section className="internal-panel internal-padded">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Eliminazione cantiere</h2>
          <p>Disponibile solo per admin. Le bozze si possono eliminare solo se non hanno dati collegati.</p>
        </div>
        <StatusBadge>{hasDependencies ? 'Bloccata' : 'Bozza eliminabile'}</StatusBadge>
      </div>

      <dl className="detail-list">
        <div><dt>Documenti collegati</dt><dd>{dependencies.documents.length}</dd></div>
        <div><dt>Movimenti collegati</dt><dd>{dependencies.movements.length}</dd></div>
        <div><dt>Foto collegate</dt><dd>{dependencies.photos.length}</dd></div>
        <div><dt>Preventivi collegati</dt><dd>{dependencies.estimates.length}</dd></div>
      </dl>

      {status ? (
        <div className={status.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}>
          <strong>{status.type === 'error' ? 'Eliminazione bloccata' : 'Completato'}</strong>
          <p>{status.message}</p>
        </div>
      ) : null}

      <button
        className="button button-secondary warning-action"
        type="button"
        onClick={deleteCantiere}
        disabled={hasDependencies || isDeleting}
      >
        {isDeleting ? 'Elimino…' : 'Elimina bozza cantiere'}
      </button>
    </section>
  )
}
