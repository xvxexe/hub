import { useState } from 'react'
import { formatCurrency, formatDate } from '../data/mockCantieri'
import { FilePreviewMock } from './FilePreviewMock'
import { StatusBadge } from './StatusBadge'

const initialVisibleItems = 3

export function RecentUploadList({ title, type, uploads, showAmount = true }) {
  const [showAll, setShowAll] = useState(false)
  const visibleUploads = showAll ? uploads : uploads.slice(0, initialVisibleItems)
  const hiddenCount = Math.max(uploads.length - visibleUploads.length, 0)

  return (
    <section className="recent-upload-section">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="recent-upload-list">
        {uploads.length > 0 ? visibleUploads.map((upload) => (
          <a
            className="recent-upload-card interactive-card"
            href={type === 'foto' ? `#/dashboard/foto/${upload.id}` : `#/dashboard/documenti/${upload.id}`}
            key={upload.id}
          >
            <FilePreviewMock fileName={upload.fileName} type={type === 'foto' ? 'image' : 'file'} />
            <div>
              <div className="recent-upload-title">
                <h3>{type === 'foto' ? upload.lavorazione : upload.descrizione}</h3>
                <StatusBadge>{upload.stato}</StatusBadge>
              </div>
              <p>
                {upload.cantiere} · {type === 'foto' ? upload.zona : upload.tipoDocumento}
              </p>
              <small>
                {formatDate(upload.dataCaricamento)} · {upload.caricatoDa}
                {type === 'documento' && showAmount ? ` · ${formatCurrency(upload.importoTotale)}` : ''}
              </small>
              <span className="text-link">Apri dettaglio</span>
            </div>
          </a>
        )) : (
          <article className="empty-inline-card">
            <strong>Nessun elemento recente</strong>
            <p>Quando saranno presenti dati mock per questa sezione, appariranno qui.</p>
          </article>
        )}
      </div>
      {hiddenCount > 0 ? (
        <button className="list-load-more" type="button" onClick={() => setShowAll(true)}>
          Mostra altri {hiddenCount}
        </button>
      ) : null}
    </section>
  )
}
