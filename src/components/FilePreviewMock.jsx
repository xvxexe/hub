export function FilePreviewMock({ fileName, type = 'file' }) {
  return (
    <div className="file-preview-mock">
      <span>{type === 'image' ? 'IMG' : 'DOC'}</span>
      <strong>{fileName || 'Nessun file selezionato'}</strong>
    </div>
  )
}
