export const recentWhatsAppUploads = [
  {
    id: 'wa-1',
    fileName: 'IMG_20260501_1042.jpg',
    cantiere: 'Barcelo Roma',
    date: '01/05/2026 10:42',
    status: 'Da controllare',
    type: 'image',
  },
  {
    id: 'wa-2',
    fileName: 'Fattura n. 1256.pdf',
    cantiere: 'Residenza Verdi',
    date: '01/05/2026 09:51',
    status: 'In attesa',
    type: 'pdf',
  },
  {
    id: 'wa-3',
    fileName: 'IMG_20260430_1833.jpg',
    cantiere: 'Negozio Centro',
    date: '30/04/2026 18:33',
    status: 'DA VERIFICARE',
    type: 'image',
  },
]

export const reminders = [
  { id: 'r-1', title: 'Verifica fatture fornitori', site: 'Residenza Verdi', due: 'Oggi', priority: 'Alta' },
  { id: 'r-2', title: 'Invio SAL n. 3', site: 'Centro Direzionale', due: '03/05', priority: 'Media' },
  { id: 'r-3', title: 'Scadenza polizza cantiere', site: 'Nuovo Polo Milano', due: '05/05', priority: 'Alta' },
  { id: 'r-4', title: 'Aggiorna cronoprogramma', site: 'Barcelo Roma', due: '07/05', priority: 'Bassa' },
]

export const siteWorkPackages = [
  { name: 'Piscina', status: 'In corso', progress: 75, budget: 180000, spent: 142350 },
  { name: 'Vitto', status: 'In corso', progress: 60, budget: 60000, spent: 38420 },
  { name: 'Alloggi', status: 'In corso', progress: 40, budget: 90000, spent: 36210 },
  { name: 'Soffitti fase 2', status: 'Pianificata', progress: 0, budget: 120000, spent: 0 },
  { name: 'FIR rifiuti', status: 'In corso', progress: 55, budget: 25000, spent: 13620 },
]

export const accountingWarnings = [
  { id: 'aw-1', title: '3 fatture senza CIG', detail: 'Totale da controllare: EUR 12.450,00', status: 'Critico' },
  { id: 'aw-2', title: '2 fornitori con DURC in scadenza', detail: 'Entro 15 giorni', status: 'Da controllare' },
]

export const pendingChecks = [
  { id: 'pc-1', title: 'DURC Nuova Edil S.r.l.', date: '03/05', status: 'Scaduto' },
  { id: 'pc-2', title: 'Assicurazione RCT', date: '05/05', status: 'In scadenza' },
  { id: 'pc-3', title: 'POS Elettrika S.p.A.', date: '08/05', status: 'Da verificare' },
  { id: 'pc-4', title: 'Cert. Camera Commercio', date: '10/05', status: 'Da verificare' },
]

export const costBreakdown = [
  { label: 'Materiali', value: 52340.2, percent: 40.7, color: '#2563eb' },
  { label: 'Manodopera', value: 34210.5, percent: 26.6, color: '#60a5fa' },
  { label: 'Noleggi / Servizi', value: 21450, percent: 16.7, color: '#f59e0b' },
  { label: 'FIR / Rifiuti', value: 11230, percent: 8.7, color: '#16a34a' },
  { label: 'Vitto / Alloggi', value: 9220.05, percent: 7.3, color: '#cbd5e1' },
]

export const recentPayments = [
  { id: 'pay-1', date: '30/04/2026', supplier: 'Nuova Edil S.r.l.', document: 'Fattura n. 1256', amount: 45230, status: 'Bonificato' },
  { id: 'pay-2', date: '29/04/2026', supplier: 'Centro Servizi Noleggi', document: 'Fattura n. 874', amount: 12850, status: 'Bonificato' },
  { id: 'pay-3', date: '27/04/2026', supplier: 'Forniture Edili Roma', document: 'Fattura n. 3321', amount: 8450, status: 'Bonificato' },
  { id: 'pay-4', date: '25/04/2026', supplier: 'Elettrika S.p.A.', document: 'Fattura n. 991', amount: 23680, status: 'In attesa' },
]
