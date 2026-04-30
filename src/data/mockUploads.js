export const tipiDocumento = ['Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Preventivo', 'Scontrino', 'Altro']

export const statiFoto = ['da revisionare', 'approvata', 'pubblicata', 'non pubblicabile']

export const statiDocumenti = [
  'da verificare',
  'confermato',
  'incompleto',
  'possibile duplicato',
  'scartato',
]

export const pubblicazioneFoto = ['da valutare', 'si', 'no']

export const mockFotoUploads = [
  {
    id: 'foto-upload-1',
    cantiereId: 'barcelo-roma',
    cantiere: 'Barcelo Roma',
    zona: 'Piscina',
    lavorazione: 'Controsoffitto',
    avanzamento: 'in corso',
    fileName: 'barcelo-piscina-controsoffitto.jpg',
    nota: 'Struttura primaria completata, manca chiusura lato impianti.',
    pubblicabile: 'da valutare',
    caricatoDa: 'Marco Ferri',
    dataCaricamento: '2026-04-30',
    stato: 'da revisionare',
  },
  {
    id: 'foto-upload-2',
    cantiereId: 'residenza-verdi',
    cantiere: 'Residenza Verdi',
    zona: 'Piano 1',
    lavorazione: 'Pareti cartongesso',
    avanzamento: 'avanzato',
    fileName: 'residenza-verdi-piano-1.jpg',
    nota: 'Pareti chiuse e pronte per rasatura.',
    pubblicabile: 'si',
    caricatoDa: 'Luca Moretti',
    dataCaricamento: '2026-04-29',
    stato: 'approvata',
  },
  {
    id: 'foto-upload-3',
    cantiereId: 'hotel-interno-milano',
    cantiere: 'Hotel Interno Milano',
    zona: 'Corridoio',
    lavorazione: 'Rasatura',
    avanzamento: 'in corso',
    fileName: 'hotel-milano-corridoio-rasatura.jpg',
    nota: 'Prima mano completata nel tratto nord.',
    pubblicabile: 'da valutare',
    caricatoDa: 'Marco Ferri',
    dataCaricamento: '2026-04-24',
    stato: 'da revisionare',
  },
]

export const mockDocumentUploads = [
  {
    id: 'doc-upload-1',
    cantiereId: 'barcelo-roma',
    cantiere: 'Barcelo Roma',
    tipoDocumento: 'Fattura',
    fornitore: 'Eurofer',
    descrizione: 'Materiali cartongesso',
    dataDocumento: '2026-04-28',
    importoTotale: 4280,
    fileName: 'fattura-eurofer-0428.pdf',
    nota: 'Da associare a SAL aprile.',
    caricatoDa: 'Sara Costa',
    dataCaricamento: '2026-04-30',
    stato: 'da verificare',
  },
  {
    id: 'doc-upload-2',
    cantiereId: 'residenza-verdi',
    cantiere: 'Residenza Verdi',
    tipoDocumento: 'Bonifico',
    fornitore: 'Falea',
    descrizione: 'Manodopera',
    dataDocumento: '2026-04-22',
    importoTotale: 3200,
    fileName: 'bonifico-falea-aprile.pdf',
    nota: 'Pagamento confermato da contabilità.',
    caricatoDa: 'Sara Costa',
    dataCaricamento: '2026-04-23',
    stato: 'confermato',
  },
  {
    id: 'doc-upload-3',
    cantiereId: 'hotel-interno-milano',
    cantiere: 'Hotel Interno Milano',
    tipoDocumento: 'FIR',
    fornitore: 'EcoRifiuti Nord',
    descrizione: 'Smaltimento',
    dataDocumento: '2026-04-19',
    importoTotale: 640,
    fileName: 'fir-rifiuti-milano.pdf',
    nota: 'Manca firma del trasportatore.',
    caricatoDa: 'Gianni Europa',
    dataCaricamento: '2026-04-20',
    stato: 'incompleto',
  },
  {
    id: 'doc-upload-4',
    cantiereId: 'negozio-centro',
    cantiere: 'Negozio Centro',
    tipoDocumento: 'Ricevuta',
    fornitore: 'Trattoria Centrale',
    descrizione: 'Vitto',
    dataDocumento: '2026-04-18',
    importoTotale: 86,
    fileName: 'ricevuta-vitto-centro.jpg',
    nota: 'Trasferta per sopralluogo tecnico.',
    caricatoDa: 'Luca Moretti',
    dataCaricamento: '2026-04-18',
    stato: 'da verificare',
  },
]

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function createFotoUpload(form, cantieri, session) {
  const cantiere = cantieri.find((item) => item.id === form.cantiereId)

  return {
    id: `foto-local-${Date.now()}`,
    cantiereId: form.cantiereId,
    cantiere: cantiere?.nome ?? 'Cantiere non selezionato',
    zona: form.zona,
    lavorazione: form.lavorazione,
    avanzamento: form.avanzamento,
    fileName: form.fileName || 'immagine-mock.jpg',
    nota: form.nota,
    pubblicabile: form.pubblicabile,
    caricatoDa: form.caricatoDa || session.name,
    dataCaricamento: todayIso(),
    stato: 'da revisionare',
  }
}

export function createDocumentUpload(form, cantieri, session) {
  const cantiere = cantieri.find((item) => item.id === form.cantiereId)

  return {
    id: `doc-local-${Date.now()}`,
    cantiereId: form.cantiereId,
    cantiere: cantiere?.nome ?? 'Cantiere non selezionato',
    tipoDocumento: form.tipoDocumento,
    fornitore: form.fornitore,
    descrizione: form.descrizione || form.tipoDocumento,
    dataDocumento: form.dataDocumento,
    importoTotale: Number(form.importoTotale || 0),
    fileName: form.fileName || 'documento-mock.pdf',
    nota: form.nota,
    caricatoDa: form.caricatoDa || session.name,
    dataCaricamento: todayIso(),
    stato: 'da verificare',
  }
}
