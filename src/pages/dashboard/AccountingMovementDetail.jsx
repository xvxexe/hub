import { DocumentDetail } from './DocumentDetail'

export function AccountingMovementDetail({ movementId, session, store }) {
  return <DocumentDetail documentId={movementId} session={session} store={store} backHref="#/dashboard/contabilita" />
}
