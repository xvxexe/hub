export const statiCantiere = ['da avviare', 'attivo', 'sospeso', 'completato', 'archiviato']

export const mockCantieri = [
  {
    id: 'barcelo-roma',
    nome: 'Barcelo Roma',
    cliente: 'Barcelo Hotels Italia',
    localita: 'Roma, zona Eur',
    indirizzo: 'Via Cristoforo Colombo 710, Roma',
    stato: 'attivo',
    responsabile: 'Gianni Europa',
    dataInizio: '2026-03-18',
    dataFinePrevista: '2026-06-28',
    avanzamento: 62,
    descrizione:
      'Intervento su camere e corridoi con controsoffitti ispezionabili, velette tecniche e ripristino finiture.',
    lavorazioni: ['Controsoffitti REI', 'Velette impianti', 'Rasature camere', 'Tinteggiatura corridoi'],
    foto: [
      { id: 'f-roma-1', titolo: 'Corridoio piano 4', data: '2026-04-28', autore: 'Marco Ferri' },
      { id: 'f-roma-2', titolo: 'Veletta reception', data: '2026-04-27', autore: 'Luca Moretti' },
      { id: 'f-roma-3', titolo: 'Chiusura botole ispezione', data: '2026-04-26', autore: 'Marco Ferri' },
    ],
    documenti: [
      { id: 'd-roma-1', nome: 'DDT profili zincati', tipo: 'DDT', stato: 'Confermato' },
      { id: 'd-roma-2', nome: 'Fattura lastre antincendio', tipo: 'Fattura', stato: 'Da verificare' },
      { id: 'd-roma-3', nome: 'Verbale sopralluogo', tipo: 'Verbale', stato: 'Confermato' },
    ],
    spese: [
      { id: 's-roma-1', voce: 'Lastre e profili', categoria: 'Materiali', importo: 18450 },
      { id: 's-roma-2', voce: 'Nolo trabattelli', categoria: 'Noleggi', importo: 2450 },
      { id: 's-roma-3', voce: 'Trasferta squadra', categoria: 'Personale', importo: 3200 },
    ],
    note: [
      'Coordinare accessi con direzione hotel entro le 8:00.',
      'Piano 5 libero dal 6 maggio per seconda squadra.',
    ],
    problemi: [
      { id: 'p-roma-1', titolo: 'Botole mancanti corridoio B', priorita: 'Media', stato: 'Aperto' },
      { id: 'p-roma-2', titolo: 'Consegna materiale REI da confermare', priorita: 'Alta', stato: 'Aperto' },
    ],
  },
  {
    id: 'residenza-verdi',
    nome: 'Residenza Verdi',
    cliente: 'Immobiliare Verdi Srl',
    localita: 'Verona, Borgo Venezia',
    indirizzo: 'Via Verdi 22, Verona',
    stato: 'attivo',
    responsabile: 'Marco Ferri',
    dataInizio: '2026-02-10',
    dataFinePrevista: '2026-05-31',
    avanzamento: 78,
    descrizione:
      'Finiture interne per palazzina residenziale con pareti divisorie, contropareti acustiche e rasature.',
    lavorazioni: ['Pareti divisorie', 'Contropareti acustiche', 'Rasature', 'Ripristini vani scala'],
    foto: [
      { id: 'f-verdi-1', titolo: 'Pareti appartamento A3', data: '2026-04-30', autore: 'Luca Moretti' },
      { id: 'f-verdi-2', titolo: 'Vano scala nord', data: '2026-04-29', autore: 'Marco Ferri' },
    ],
    documenti: [
      { id: 'd-verdi-1', nome: 'SAL aprile', tipo: 'SAL', stato: 'Da verificare' },
      { id: 'd-verdi-2', nome: 'Ordine materiale isolamento', tipo: 'Ordine', stato: 'Confermato' },
    ],
    spese: [
      { id: 's-verdi-1', voce: 'Isolante acustico', categoria: 'Materiali', importo: 7900 },
      { id: 's-verdi-2', voce: 'Manodopera extra scala', categoria: 'Personale', importo: 1350 },
    ],
    note: ['Cliente chiede consegna appartamenti campione entro meta maggio.'],
    problemi: [{ id: 'p-verdi-1', titolo: 'Umidita parete piano terra', priorita: 'Alta', stato: 'Aperto' }],
  },
  {
    id: 'negozio-centro',
    nome: 'Negozio Centro',
    cliente: 'Retail Nord',
    localita: 'Verona, Centro storico',
    indirizzo: 'Corso Porta Borsari 9, Verona',
    stato: 'da avviare',
    responsabile: 'Luca Moretti',
    dataInizio: '2026-05-08',
    dataFinePrevista: '2026-06-05',
    avanzamento: 12,
    descrizione:
      'Preparazione locale commerciale con pareti tecniche, controsoffitto illuminazione e finiture rapide.',
    lavorazioni: ['Tracciamento pareti', 'Controsoffitto illuminazione', 'Nicchie tecniche', 'Tinteggiatura finale'],
    foto: [{ id: 'f-centro-1', titolo: 'Stato locali prima avvio', data: '2026-04-24', autore: 'Gianni Europa' }],
    documenti: [
      { id: 'd-centro-1', nome: 'Preventivo firmato', tipo: 'Preventivo', stato: 'Confermato' },
      { id: 'd-centro-2', nome: 'Planimetria negozio', tipo: 'Tecnico', stato: 'Confermato' },
    ],
    spese: [{ id: 's-centro-1', voce: 'Acconto materiali', categoria: 'Materiali', importo: 2500 }],
    note: ['Verificare vincoli orari per accesso in ZTL.'],
    problemi: [{ id: 'p-centro-1', titolo: 'Permesso carico/scarico in attesa', priorita: 'Media', stato: 'Aperto' }],
  },
  {
    id: 'hotel-interno-milano',
    nome: 'Hotel Interno Milano',
    cliente: 'Milano Hospitality Group',
    localita: 'Milano, Porta Nuova',
    indirizzo: 'Via Melchiorre Gioia 48, Milano',
    stato: 'sospeso',
    responsabile: 'Gianni Europa',
    dataInizio: '2026-01-22',
    dataFinePrevista: '2026-07-15',
    avanzamento: 44,
    descrizione:
      'Ristrutturazione interna di sale comuni con pareti curve in cartongesso e isolamento acustico.',
    lavorazioni: ['Pareti curve', 'Isolamento acustico', 'Controsoffitti sala meeting', 'Rasature speciali'],
    foto: [
      { id: 'f-milano-1', titolo: 'Sala meeting sospesa', data: '2026-04-11', autore: 'Marco Ferri' },
      { id: 'f-milano-2', titolo: 'Parete curva lobby', data: '2026-04-10', autore: 'Luca Moretti' },
    ],
    documenti: [
      { id: 'd-milano-1', nome: 'Comunicazione sospensione lavori', tipo: 'Comunicazione', stato: 'Confermato' },
      { id: 'd-milano-2', nome: 'Fattura materiali acustici', tipo: 'Fattura', stato: 'Da verificare' },
    ],
    spese: [
      { id: 's-milano-1', voce: 'Pannelli acustici', categoria: 'Materiali', importo: 11200 },
      { id: 's-milano-2', voce: 'Trasporto Milano', categoria: 'Logistica', importo: 1750 },
    ],
    note: ['Lavori sospesi in attesa di variante impiantistica del cliente.'],
    problemi: [{ id: 'p-milano-1', titolo: 'Variante impianti non approvata', priorita: 'Alta', stato: 'Aperto' }],
  },
  {
    id: 'condominio-bianchi',
    nome: 'Condominio Bianchi',
    cliente: 'Amministrazione Bianchi',
    localita: 'Padova, Arcella',
    indirizzo: 'Via Tiziano Aspetti 80, Padova',
    stato: 'completato',
    responsabile: 'Sara Costa',
    dataInizio: '2026-01-08',
    dataFinePrevista: '2026-04-18',
    avanzamento: 100,
    descrizione:
      'Ripristino vani scala e locali tecnici con controsoffitti, rasature e tinteggiatura lavabile.',
    lavorazioni: ['Ripristino vani scala', 'Controsoffitti locali tecnici', 'Rasature', 'Tinteggiatura lavabile'],
    foto: [
      { id: 'f-bianchi-1', titolo: 'Vano scala completato', data: '2026-04-18', autore: 'Marco Ferri' },
      { id: 'f-bianchi-2', titolo: 'Locale tecnico finito', data: '2026-04-17', autore: 'Luca Moretti' },
    ],
    documenti: [
      { id: 'd-bianchi-1', nome: 'Verbale consegna lavori', tipo: 'Verbale', stato: 'Confermato' },
      { id: 'd-bianchi-2', nome: 'Fattura saldo', tipo: 'Fattura', stato: 'Confermato' },
      { id: 'd-bianchi-3', nome: 'Foto fine lavori', tipo: 'Report', stato: 'Confermato' },
    ],
    spese: [
      { id: 's-bianchi-1', voce: 'Materiali finitura', categoria: 'Materiali', importo: 4300 },
      { id: 's-bianchi-2', voce: 'Smaltimento', categoria: 'Servizi', importo: 680 },
    ],
    note: ['Cliente soddisfatto, possibile manutenzione annuale da proporre.'],
    problemi: [],
  },
]

export function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function getCantiereById(id) {
  return mockCantieri.find((cantiere) => cantiere.id === id)
}

export function getCantiereTotals(cantiere) {
  return {
    documenti: cantiere.documenti.length,
    foto: cantiere.foto.length,
    spese: cantiere.spese.reduce((total, spesa) => total + spesa.importo, 0),
    problemi: cantiere.problemi.length,
  }
}
