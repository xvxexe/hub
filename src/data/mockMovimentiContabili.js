export const categorieContabili = [
  'Materiali',
  'Manodopera',
  'Non materiali',
  'Extra / Altro',
  'Vitto',
  'Alloggi',
  'FIR / Rifiuti',
  'Bonifici / Pagamenti',
  'Noleggi / Servizi',
]

export const tipiDocumentoContabili = ['Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Scontrino', 'Preventivo', 'Altro']

export const statiVerificaContabili = [
  'Da verificare',
  'Confermato',
  'Incompleto',
  'Possibile duplicato',
  'Scartato',
]

export const metodiPagamentoContabili = ['Bonifico', 'Carta', 'Contanti', 'Da collegare', 'Non indicato']

export const mockMovimentiContabili = [
  {
    id: 'mov-001',
    cantiereId: 'barcelo-roma',
    data: '2026-04-28',
    descrizione: 'Materiali cartongesso camere e corridoi',
    fornitore: 'Eurofer',
    categoria: 'Materiali',
    tipoDocumento: 'Fattura',
    numeroDocumento: 'FE-2026-184',
    imponibile: 4200,
    iva: 924,
    totale: 5124,
    pagamento: 'Da collegare',
    statoVerifica: 'Da verificare',
    documentoCollegato: 'fattura-eurofer-0428.pdf',
    note: 'Fattura da collegare al bonifico Falea/Eurofer di fine mese.',
  },
  {
    id: 'mov-002',
    cantiereId: 'barcelo-roma',
    data: '2026-04-29',
    descrizione: 'Manodopera squadra trasferta',
    fornitore: 'Falea',
    categoria: 'Manodopera',
    tipoDocumento: 'Bonifico',
    numeroDocumento: 'BON-0429',
    imponibile: 0,
    iva: 0,
    totale: 3200,
    pagamento: 'Bonifico',
    statoVerifica: 'Confermato',
    documentoCollegato: 'bonifico-falea-aprile.pdf',
    note: 'Collegato a documento mock.',
  },
  {
    id: 'mov-003',
    cantiereId: 'barcelo-roma',
    data: '2026-04-30',
    descrizione: 'Ricevuta pranzo squadra',
    fornitore: 'Bar Tavola Eur',
    categoria: 'Vitto',
    tipoDocumento: 'Ricevuta',
    numeroDocumento: 'RIC-884',
    imponibile: 92,
    iva: 9,
    totale: 101,
    pagamento: 'Carta',
    statoVerifica: 'Da verificare',
    documentoCollegato: 'ricevuta-pranzo-eur.jpg',
    note: 'Verificare presenza nominativi squadra.',
  },
  {
    id: 'mov-004',
    cantiereId: 'barcelo-roma',
    data: '2026-04-24',
    descrizione: 'Hotel operai Roma',
    fornitore: 'Hotel Cristoforo',
    categoria: 'Alloggi',
    tipoDocumento: 'Fattura',
    numeroDocumento: 'HCR-311',
    imponibile: 680,
    iva: 68,
    totale: 748,
    pagamento: 'Bonifico',
    statoVerifica: 'Confermato',
    documentoCollegato: 'fattura-hotel-roma.pdf',
    note: 'Alloggio squadra per tre notti.',
  },
  {
    id: 'mov-005',
    cantiereId: 'residenza-verdi',
    data: '2026-04-18',
    descrizione: 'Isolante acustico e profili',
    fornitore: 'EdilNord',
    categoria: 'Materiali',
    tipoDocumento: 'Fattura',
    numeroDocumento: 'EN-551',
    imponibile: 7900,
    iva: 1738,
    totale: 9638,
    pagamento: 'Bonifico',
    statoVerifica: 'Confermato',
    documentoCollegato: 'fattura-edilnord-verdi.pdf',
    note: 'Materiale consegnato piano terra e piano 1.',
  },
  {
    id: 'mov-006',
    cantiereId: 'residenza-verdi',
    data: '2026-04-21',
    descrizione: 'Manodopera extra vano scala',
    fornitore: 'Squadra Moretti',
    categoria: 'Manodopera',
    tipoDocumento: 'Ricevuta',
    numeroDocumento: 'RM-044',
    imponibile: 1350,
    iva: 0,
    totale: 1350,
    pagamento: 'Da collegare',
    statoVerifica: 'Incompleto',
    documentoCollegato: 'ricevuta-moretti-scala.pdf',
    note: 'Importo senza IVA: controllare regime documento.',
  },
  {
    id: 'mov-007',
    cantiereId: 'negozio-centro',
    data: '2026-04-20',
    descrizione: 'Acconto materiali avvio negozio',
    fornitore: 'Ferramenta Scala',
    categoria: 'Materiali',
    tipoDocumento: 'Scontrino',
    numeroDocumento: 'SC-1022',
    imponibile: 250,
    iva: 55,
    totale: 305,
    pagamento: 'Carta',
    statoVerifica: 'Da verificare',
    documentoCollegato: 'scontrino-ferramenta-centro.jpg',
    note: 'Scontrino ferramenta da associare a cantiere.',
  },
  {
    id: 'mov-008',
    cantiereId: 'negozio-centro',
    data: '2026-04-22',
    descrizione: 'Noleggio piattaforma accesso vetrina',
    fornitore: 'NoloVerona',
    categoria: 'Noleggi / Servizi',
    tipoDocumento: 'Preventivo',
    numeroDocumento: 'PRE-778',
    imponibile: 620,
    iva: 136,
    totale: 756,
    pagamento: 'Non indicato',
    statoVerifica: 'Da verificare',
    documentoCollegato: 'preventivo-nolo-piattaforma.pdf',
    note: 'Preventivo da confermare prima avvio lavori.',
  },
  {
    id: 'mov-009',
    cantiereId: 'hotel-interno-milano',
    data: '2026-04-10',
    descrizione: 'Pannelli acustici sale meeting',
    fornitore: 'Acustica Milano',
    categoria: 'Materiali',
    tipoDocumento: 'Fattura',
    numeroDocumento: 'AM-908',
    imponibile: 11200,
    iva: 2464,
    totale: 13664,
    pagamento: 'Da collegare',
    statoVerifica: 'Possibile duplicato',
    documentoCollegato: 'fattura-acustica-milano.pdf',
    note: 'Possibile duplicato con fattura materiali acustici caricata in aprile.',
  },
  {
    id: 'mov-010',
    cantiereId: 'hotel-interno-milano',
    data: '2026-04-12',
    descrizione: 'FIR rifiuti cartongesso',
    fornitore: 'EcoRifiuti Nord',
    categoria: 'FIR / Rifiuti',
    tipoDocumento: 'FIR',
    numeroDocumento: 'FIR-3301',
    imponibile: 640,
    iva: 141,
    totale: 781,
    pagamento: 'Da collegare',
    statoVerifica: 'Incompleto',
    documentoCollegato: 'fir-rifiuti-milano.pdf',
    note: 'Manca firma del trasportatore.',
  },
  {
    id: 'mov-011',
    cantiereId: 'hotel-interno-milano',
    data: '2026-04-15',
    descrizione: 'Bonifico fornitore materiali acustici',
    fornitore: 'Acustica Milano',
    categoria: 'Bonifici / Pagamenti',
    tipoDocumento: 'Bonifico',
    numeroDocumento: 'BON-0415-AM',
    imponibile: 0,
    iva: 0,
    totale: 13664,
    pagamento: 'Bonifico',
    statoVerifica: 'Confermato',
    documentoCollegato: 'bonifico-acustica-milano.pdf',
    note: 'Pagamento da collegare a fattura.',
  },
  {
    id: 'mov-012',
    cantiereId: 'condominio-bianchi',
    data: '2026-04-03',
    descrizione: 'Materiali finitura vani scala',
    fornitore: 'Colorificio Padova',
    categoria: 'Materiali',
    tipoDocumento: 'Fattura',
    numeroDocumento: 'CP-442',
    imponibile: 4300,
    iva: 946,
    totale: 5246,
    pagamento: 'Bonifico',
    statoVerifica: 'Confermato',
    documentoCollegato: 'fattura-colorificio-padova.pdf',
    note: 'Documento collegato al saldo finale.',
  },
  {
    id: 'mov-013',
    cantiereId: 'condominio-bianchi',
    data: '2026-04-05',
    descrizione: 'Smaltimento residui lavorazioni',
    fornitore: 'EcoPadova',
    categoria: 'FIR / Rifiuti',
    tipoDocumento: 'FIR',
    numeroDocumento: 'FIR-882',
    imponibile: 680,
    iva: 150,
    totale: 830,
    pagamento: 'Carta',
    statoVerifica: 'Confermato',
    documentoCollegato: 'fir-ecopadova.pdf',
    note: 'FIR completo e archiviato.',
  },
  {
    id: 'mov-014',
    cantiereId: 'residenza-verdi',
    data: '2026-04-25',
    descrizione: 'Consulenza tecnica acustica',
    fornitore: 'Studio Tecnico Riva',
    categoria: 'Non materiali',
    tipoDocumento: 'Fattura',
    numeroDocumento: 'STR-077',
    imponibile: 900,
    iva: 198,
    totale: 1098,
    pagamento: 'Da collegare',
    statoVerifica: 'Da verificare',
    documentoCollegato: 'fattura-riva-acustica.pdf',
    note: 'Verificare imputazione tra cantiere e progettazione.',
  },
  {
    id: 'mov-015',
    cantiereId: 'negozio-centro',
    data: '2026-04-26',
    descrizione: 'Permesso ZTL e marche',
    fornitore: 'Comune di Verona',
    categoria: 'Extra / Altro',
    tipoDocumento: 'Altro',
    numeroDocumento: 'ZTL-2026-44',
    imponibile: 75,
    iva: 0,
    totale: 75,
    pagamento: 'Contanti',
    statoVerifica: 'Scartato',
    documentoCollegato: 'permesso-ztl-verona.pdf',
    note: 'Documento non fiscalmente rilevante, tenere solo come nota operativa.',
  },
]

export function getMovimentiByCantiere(cantiereId, rows = mockMovimentiContabili) {
  return rows.filter((movimento) => movimento.cantiereId === cantiereId)
}

export function getAccountingTotals(rows) {
  return rows.reduce(
    (totals, row) => {
      totals.imponibile += row.imponibile
      totals.iva += row.iva
      totals.totale += row.totale
      if (row.statoVerifica === 'Da verificare') totals.daVerificare += 1
      if (row.statoVerifica === 'Possibile duplicato') totals.duplicati += 1
      if (row.categoria === 'Bonifici / Pagamenti' || row.tipoDocumento === 'Bonifico') {
        totals.pagamenti += row.totale
      }
      return totals
    },
    { imponibile: 0, iva: 0, totale: 0, daVerificare: 0, duplicati: 0, pagamenti: 0 },
  )
}

export function getCategoryTotals(rows) {
  return categorieContabili.map((categoria) => ({
    categoria,
    totale: rows
      .filter((row) => row.categoria === categoria)
      .reduce((sum, row) => sum + row.totale, 0),
  }))
}

export function getSiteAccountingSummaries(cantieri, rows) {
  return cantieri.map((cantiere) => {
    const movimenti = getMovimentiByCantiere(cantiere.id, rows)
    const totals = getAccountingTotals(movimenti)
    const categories = getCategoryTotals(movimenti)
      .filter((item) => item.totale > 0)
      .sort((a, b) => b.totale - a.totale)

    return {
      cantiere,
      movimenti,
      totals,
      categories,
    }
  })
}

export function getAccountingAlerts(rows) {
  return rows
    .flatMap((row) => {
      const alerts = []
      if (row.statoVerifica === 'Da verificare') alerts.push('Documento da verificare')
      if (row.statoVerifica === 'Possibile duplicato') alerts.push('Possibile duplicato')
      if (row.tipoDocumento === 'Bonifico' && row.note.toLowerCase().includes('collegare')) {
        alerts.push('Bonifico senza fattura collegata')
      }
      if (row.tipoDocumento === 'Fattura' && row.pagamento === 'Da collegare') {
        alerts.push('Fattura senza pagamento collegato')
      }
      if (row.statoVerifica === 'Incompleto') alerts.push('Importo incompleto')
      if (row.iva === 0 && row.tipoDocumento === 'Fattura') alerts.push('IVA da controllare')

      return alerts.map((message) => ({
        id: `${row.id}-${message}`,
        message,
        movimento: row,
      }))
    })
    .slice(0, 8)
}

export function validateMovementTotals(rows = mockMovimentiContabili) {
  return rows.every((row) => {
    const isPurePayment = row.tipoDocumento === 'Bonifico' && row.imponibile === 0 && row.iva === 0
    return isPurePayment || row.imponibile + row.iva === row.totale
  })
}
