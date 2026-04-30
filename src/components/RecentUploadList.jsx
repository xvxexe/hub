import { formatCurrency, formatDate } from '../data/mockCantieri'
import { FilePreviewMock } from './FilePreviewMock'
import { StatusBadge } from './StatusBadge'

export function RecentUploadList({ title, type, uploads, showAmount = true }) {
  return (
    <section className="recent-upload-section">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="recent-upload-list">
        {uploads.map((upload) => (
          <article className="recent-upload-card" key={upload.id}>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
