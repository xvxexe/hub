const SPREADSHEET_ID = '1J3fW7BwEF6fAqtXxbKpLdSR5NVVbP2cMeZIHFr7bbao';
const SYNC_DATA_SHEET = 'Hub_Sync_Data';
const SYNC_LOG_SHEET = 'Hub_Sync_Log';
const DEFAULT_CANTIERE_ID = 'barcelo-roma';
const DEFAULT_CANTIERE_NAME = 'Barcelò Roma';

const SUMMARY_TABS = [
  'Piscina',
  'Vitto',
  'Alloggi',
  'Scala_Aiuola',
  'Soffitti_F2',
  'Scarichi_Pergole',
  'Massetti_Griglia',
  'Lavori_Extra_Annesso',
  'Rifiuti_Container',
  'Da_classificare',
  'Allungamento_ Marciapiede_Ristorante',
  'Chiusura_Pilastri_Muratura',
  'Fase2_Rete_Soffitti_Antincendio',
  'Piscina_Impianti_Elettrici',
  'Materiale_Fase_Due',
  'Fabbro_Tanasuica_Georgian',
  'Riempimento_Aiuole',
  'Lavori_Extra_Non_Specificati',
  'Impianto_Irrigazione',
  'FIR_rifiuti',
];

const SYNC_HEADERS = [
  'id',
  'cantiereId',
  'cantiere',
  'tipoDocumento',
  'fornitore',
  'descrizione',
  'numeroDocumento',
  'dataDocumento',
  'categoria',
  'imponibile',
  'iva',
  'totale',
  'pagamento',
  'statoVerifica',
  'fileName',
  'note',
  'sheetTab',
  'movimentiCount',
  'source',
  'updatedAt',
];

function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'import';
  try {
    ensureSyncSheets_();
    if (action === 'import') return json_({ ok: true, ...buildStoreFromMaster_() });
    if (action === 'ping') return json_({ ok: true, message: 'Google Sheets sync online', spreadsheetId: SPREADSHEET_ID });
    return json_({ ok: false, error: `Azione non supportata: ${action}` });
  } catch (error) {
    return json_({ ok: false, error: error.message, stack: error.stack });
  }
}

function doPost(e) {
  try {
    ensureSyncSheets_();
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (body.action !== 'export') return json_({ ok: false, error: 'Azione POST non supportata.' });
    const summary = exportStoreToSyncSheet_(body.store || {});
    return json_({ ok: true, summary });
  } catch (error) {
    return json_({ ok: false, error: error.message, stack: error.stack });
  }
}

function setupHubSyncSheets() {
  ensureSyncSheets_();
  SpreadsheetApp.getUi().alert('Hub sync pronto: creati/aggiornati Hub_Sync_Data e Hub_Sync_Log.');
}

function buildStoreFromMaster_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const documents = [];

  SUMMARY_TABS.forEach((tabName) => {
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) return;
    const values = sheet.getDataRange().getDisplayValues();
    const totals = readTabTotals_(values);
    if (totals.totale === 0 && totals.imponibile === 0 && totals.iva === 0) return;

    documents.push({
      id: `sheet-${slug_(tabName)}`,
      cantiereId: DEFAULT_CANTIERE_ID,
      cantiere: DEFAULT_CANTIERE_NAME,
      tipoDocumento: 'Riepilogo tab',
      fornitore: 'BARCELO_ROMA_master',
      descrizione: `${tabName} - ${labelFromTab_(tabName)}`,
      numeroDocumento: tabName,
      dataDocumento: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      categoria: guessCategory_(tabName),
      imponibile: totals.imponibile,
      iva: totals.iva,
      totale: totals.totale,
      importoTotale: totals.totale,
      pagamento: tabName === 'Da_classificare' ? 'Da classificare' : 'Da dettaglio Google Sheets',
      statoVerifica: 'Confermato',
      stato: 'confermato',
      fileName: 'BARCELO_ROMA_master',
      note: `${totals.movimenti || 1} movimenti nel tab ${tabName}. Fonte: Google Sheets BARCELO_ROMA_master.`,
      nota: `${totals.movimenti || 1} movimenti nel tab ${tabName}. Fonte: Google Sheets BARCELO_ROMA_master.`,
      source: 'google-sheets-sync',
      sheetTab: tabName,
      movimentiCount: totals.movimenti || 1,
      updatedAt: new Date().toISOString(),
    });
  });

  const exportedDocs = readHubSyncData_(ss);
  const mergedDocuments = mergeDocuments_(documents, exportedDocs);
  const store = {
    documents: mergedDocuments,
    photos: [],
    estimates: [],
    notes: [],
    activities: [{
      id: `activity-sync-${Date.now()}`,
      date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      author: 'Google Sheets Sync',
      type: 'sync',
      description: 'Importati dati da BARCELO_ROMA_master tramite Google Apps Script',
      entityType: 'google-sheet',
      entityId: SPREADSHEET_ID,
    }],
    source: {
      type: 'google-sheets',
      name: 'BARCELO_ROMA_master',
      spreadsheetId: SPREADSHEET_ID,
      importedAt: new Date().toISOString(),
      mode: 'apps-script-sync',
      totals: mergedDocuments.reduce((acc, doc) => {
        acc.imponibile += Number(doc.imponibile || 0);
        acc.iva += Number(doc.iva || 0);
        acc.totale += Number(doc.totale || 0);
        return acc;
      }, { imponibile: 0, iva: 0, totale: 0, tabs: mergedDocuments.length }),
    },
  };

  log_('IMPORT_TO_SUPABASE_PAYLOAD', `Documenti preparati: ${mergedDocuments.length}`);
  return { store, summary: { documents: mergedDocuments.length, photos: 0, estimates: 0 } };
}

function exportStoreToSyncSheet_(store) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SYNC_DATA_SHEET);
  const docs = Array.isArray(store.documents) ? store.documents : [];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, SYNC_HEADERS.length).setValues([SYNC_HEADERS]);

  const rows = docs.map((doc) => SYNC_HEADERS.map((header) => {
    if (header === 'updatedAt') return new Date().toISOString();
    return doc[header] ?? '';
  }));

  if (rows.length) sheet.getRange(2, 1, rows.length, SYNC_HEADERS.length).setValues(rows);
  sheet.autoResizeColumns(1, SYNC_HEADERS.length);
  log_('EXPORT_FROM_SUPABASE', `Documenti esportati in ${SYNC_DATA_SHEET}: ${rows.length}`);
  return { documents: rows.length, sheet: SYNC_DATA_SHEET };
}

function readHubSyncData_(ss) {
  const sheet = ss.getSheetByName(SYNC_DATA_SHEET);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const doc = {};
      headers.forEach((header, index) => { if (header) doc[header] = row[index]; });
      doc.imponibile = Number(doc.imponibile || 0);
      doc.iva = Number(doc.iva || 0);
      doc.totale = Number(doc.totale || 0);
      doc.importoTotale = doc.totale;
      doc.stato = String(doc.statoVerifica || 'Da verificare').toLowerCase();
      return doc;
    });
}

function mergeDocuments_(masterDocs, syncedDocs) {
  const map = new Map();
  masterDocs.forEach((doc) => map.set(doc.id, doc));
  syncedDocs.forEach((doc) => {
    if (!doc.id) return;
    map.set(doc.id, { ...map.get(doc.id), ...doc, source: doc.source || 'hub-sync-data' });
  });
  return Array.from(map.values());
}

function readTabTotals_(values) {
  const flatRows = values.map((row) => row.map((cell) => String(cell || '').trim()));
  const text = flatRows.flat().join(' ').toLowerCase();
  const allNumbers = flatRows.flat().map(parseNumber_).filter((value) => value !== null && value > 0);
  const total = findValueNear_(flatRows, ['totale generale', 'totale spese', 'totale complessivo', 'totale']) || Math.max(...allNumbers, 0);
  const imponibile = findValueNear_(flatRows, ['imponibile', 'totale imponibile']) || 0;
  const iva = findValueNear_(flatRows, ['iva', 'totale iva']) || 0;
  const movimentoRows = flatRows.filter((row) => row.some((cell) => /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(cell)) || row.some((cell) => parseNumber_(cell) !== null && parseNumber_(cell) > 0));

  return {
    imponibile: round2_(imponibile),
    iva: round2_(iva),
    totale: round2_(total),
    movimenti: Math.max(1, Math.min(movimentoRows.length, 999)),
    debug: text.slice(0, 120),
  };
}

function findValueNear_(rows, labels) {
  for (let r = 0; r < rows.length; r += 1) {
    for (let c = 0; c < rows[r].length; c += 1) {
      const cell = rows[r][c].toLowerCase();
      if (!labels.some((label) => cell.includes(label))) continue;
      for (let offset = 1; offset <= 6; offset += 1) {
        const right = rows[r][c + offset];
        const valueRight = parseNumber_(right);
        if (valueRight !== null) return valueRight;
      }
      for (let offset = 1; offset <= 6; offset += 1) {
        const down = rows[r + offset] && rows[r + offset][c];
        const valueDown = parseNumber_(down);
        if (valueDown !== null) return valueDown;
      }
    }
  }
  return 0;
}

function parseNumber_(value) {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).replace(/€/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function guessCategory_(tabName) {
  const t = tabName.toLowerCase();
  if (t.includes('vitto')) return 'Vitto';
  if (t.includes('alloggi')) return 'Alloggi';
  if (t.includes('rifiuti') || t.includes('fir') || t.includes('container')) return 'FIR / Rifiuti';
  if (t.includes('bonific') || t.includes('classificare')) return 'Bonifici / Pagamenti';
  if (t.includes('fabbro')) return 'Manodopera';
  if (t.includes('noleggi')) return 'Noleggi / Servizi';
  return 'Materiali';
}

function labelFromTab_(tabName) {
  return tabName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function slug_(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function round2_(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function ensureSyncSheets_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let dataSheet = ss.getSheetByName(SYNC_DATA_SHEET);
  if (!dataSheet) dataSheet = ss.insertSheet(SYNC_DATA_SHEET);
  if (dataSheet.getLastRow() === 0) dataSheet.getRange(1, 1, 1, SYNC_HEADERS.length).setValues([SYNC_HEADERS]);

  let logSheet = ss.getSheetByName(SYNC_LOG_SHEET);
  if (!logSheet) logSheet = ss.insertSheet(SYNC_LOG_SHEET);
  if (logSheet.getLastRow() === 0) logSheet.getRange(1, 1, 1, 3).setValues([['timestamp', 'azione', 'note']]);
}

function log_(action, note) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SYNC_LOG_SHEET);
  sheet.appendRow([new Date(), action, note]);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
