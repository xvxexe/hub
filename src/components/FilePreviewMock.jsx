import { useState } from 'react'
import { createSignedFileUrl } from '../lib/supabaseStorage'

export function FilePreviewMock({ fileName, type = 'file', storagePath, storageBucket }) {
  const [status, setStatus] = useState(null)
  const hasRealFile = Boolean(storagePath && storageBucket)

  async function openFile() {
    setStatus(null)
    const signed = await createSignedFileUrl({ bucket: storageBucket, storagePath })
    if (signed.error) {
      setStatus({ type: 'error', message: signed.error.message })
      return
    }
    if (signed.data?.signedUrl) {
      window.open(signed.data.signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="file-preview-mock">
      <span>{type === 'image' ? 'IMG' : 'DOC'}</span>
      <strong>{fileName || 'Nessun file selezionato'}</strong>
      {hasRealFile ? (
        <button className="button button-secondary button-small" type="button" onClick={openFile}>
          Apri file
        </button>
      ) : null}
      {status?.type === 'error' ? <small>{status.message}</small> : null}
    </div>
  )
}
