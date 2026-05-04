const SPREADSHEET_ID = '1J3fW7BwEF6fAqtXxbKpLdSR5NVVbP2cMeZIHFr7bbao';
const SYNC_DATA_SHEET = 'Hub_Sync_Data';
const SYNC_LOG_SHEET = 'Hub_Sync_Log';
const DELETED_RECORDS_SHEET = 'Deleted_Records';
const RIEPILOGO_SHEET = 'Riepilogo';
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

const DELETED_RECORDS_HEADERS = [
  'entity_type',
  'entity_id',
  'source',
  'deleted_at',
  'deleted_by_name',
  'reason',
  'storage_bucket',
  'storage_path',
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
    const summary = exportStoreToSyncSheet_(body.store || {}, body.deletedRecords || []);
    return json_({ ok: true, summary });
  } catch (error) {
    return json_({ ok: false, error: error.message, stack: error.stack });
  }
}

function setupHubSyncSheets() {
  ensureSyncSheets_();
  SpreadsheetApp.getUi().alert('Hub sync pronto: creati/aggiornati Hub_Sync_Data, Hub_Sync_Log e Deleted_Records.');
}

function buildStoreFromMaster_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const riepilogoDocuments = readRiepilogoDocuments_(ss);
  const tabDocuments = riepilogoDocuments.length ? [] : readSummaryTabDocuments_(ss);
  const masterDocuments = riepilogoDocuments.length ? riepilogoDocuments : tabDocuments;
  const exportedDocs = readHubSyncData_(ss);
  const mergedDocuments = mergeDocuments_(masterDocuments, exportedDocs);
  const totals = mergedDocuments.reduce((acc, doc) => {
    acc.imponibile += Number(doc.imponibile || 0);
    acc.iva += Number(doc.iva || 0);
    acc.totale += Number(doc.totale || 0);
    acc.tabs += 1;
    return acc;
  }, { imponibile: 0, iva: 0, totale: 0, tabs: 0 });

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
      description: riepilogoDocuments.length
        ? `Importati ${riepilogoDocuments.length} tab dal foglio Riepilogo BARCELO_ROMA_master`
        : 'Importati dati da BARCELO_ROMA_master tramite tab singoli',
      entityType: 'google-sheet',
      entityId: SPREADSHEET_ID,
    }],
    source: {
      type: 'google-sheets',
      name: 'BARCELO_ROMA_master',
      spreadsheetId: SPREADSHEET_ID,
      importedAt: new Date().toISOString(),
      mode: riepilogoDocuments.length ? 'riepilogo-sheet-sync' : 'apps-script-sync',
      totals,
    },
  };

  log_('IMPORT_TO_SUPABASE_PAYLOAD', `Documenti preparati: ${mergedDocuments.length}; totale: ${round2_(totals.totale)}; fonte: ${riepilogoDocuments.length ? RIEPILOGO_SHEET : 'tab singoli'}`);
  return { store, summary: { documents: mergedDocuments.length, photos: 0, estimates: 0, totals } };
}

function readSummaryTabDocuments_(ss) {
  const documents = [];

  SUMMARY_TABS.forEach((tabName) => {
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) return;
    const displayValues = sheet.getDataRange().getDisplayValues();
    const rawValues = sheet.getDataRange().getValues();
    const totals = readTabTotals_(displayValues, rawValues);
    if (totals.totale === 0 && totals.imponibile === 0 && totals.iva === 0) return;
    documents.push(createTabDocument_(tabName, labelFromTab_(tabName), totals, 'tab-singolo'));
  });

  return documents;
}

function readRiepilogoDocuments_(ss) {
  const sheet = ss.getSheetByName(RIEPILOGO_SHEET);
  if (!sheet) return [];

  const range = sheet.getDataRange();
  const displayValues = range.getDisplayValues();
  const rawValues = range.getValues();
  const normalizedRows = displayValues.map((row) => row.map(normalizeLabel_));
  const headerIndex = normalizedRows.findIndex((row) => (
    row.includes('tab principale')
    && row.includes('descrizione')
    && row.some((cell) => cell.includes('movimenti'))
    && row.includes('imponibile')
    && row.includes('iva')
    && row.includes('totale')
  ));

  if (headerIndex < 0) return [];

  const headers = normalizedRows[headerIndex];
  const tabIndex = headers.indexOf('tab principale');
  const descriptionIndex = headers.indexOf('descrizione');
  const movementsIndex = headers.findIndex((cell) => cell.includes('movimenti'));
  const imponibileIndex = headers.indexOf('imponibile');
  const ivaIndex = headers.indexOf('iva');
  const totaleIndex = headers.indexOf('totale');
  const documents = [];

  for (let r = headerIndex + 1; r < displayValues.length; r += 1) {
    const displayRow = displayValues[r];
    const rawRow = rawValues[r];
    const tabName = String(displayRow[tabIndex] || '').trim();
    const description = String(displayRow[descriptionIndex] || '').trim();
    if (!tabName) continue;

    const totals = {
      movimenti: Math.max(1, Math.round(getNumberAt_(displayRow, rawRow, movementsIndex) || 1)),
      imponibile: round2_(getNumberAt_(displayRow, rawRow, imponibileIndex) || 0),
      iva: round2_(getNumberAt_(displayRow, rawRow, ivaIndex) || 0),
      totale: round2_(getNumberAt_(displayRow, rawRow, totaleIndex) || 0),
    };

    if (totals.totale === 0 && totals.imponibile === 0 && totals.iva === 0) continue;
    documents.push(createTabDocument_(tabName, description || labelFromTab_(tabName), totals, RIEPILOGO_SHEET));
  }

  return documents;
}

function createTabDocument_(tabName, description, totals, sourceTab) {
  return {
    id: `sheet-${slug_(tabName)}`,
    cantiereId: DEFAULT_CANTIERE_ID,
    cantiere: DEFAULT_CANTIERE_NAME,
    tipoDocumento: 'Riepilogo tab',
    fornitore: 'BARCELO_ROMA_master',
    descrizione: `${tabName} - ${description}`,
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
    note: `${totals.movimenti || 1} movimenti nel tab ${tabName}. Fonte: ${sourceTab} / BARCELO_ROMA_master.`,
    nota: `${totals.movimenti || 1} movimenti nel tab ${tabName}. Fonte: ${sourceTab} / BARCELO_ROMA_master.`,
    source: 'google-sheets-sync',
    sheetTab: tabName,
    movimentiCount: totals.movimenti || 1,
    updatedAt: new Date().toISOString(),
  };
}

function exportStoreToSyncSheet_(store, deletedRecords) {
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

  const deletedCount = exportDeletedRecords_(ss, deletedRecords);
  log_('EXPORT_FROM_SUPABASE', `Documenti esportati in ${SYNC_DATA_SHEET}: ${rows.length}; eliminati tracciati: ${deletedCount}`);
  return { documents: rows.length, deletedRecords: deletedCount, sheet: SYNC_DATA_SHEET, deletedSheet: DELETED_RECORDS_SHEET };
}

function exportDeletedRecords_(ss, deletedRecords) {
  const sheet = ss.getSheetByName(DELETED_RECORDS_SHEET);
  const records = Array.isArray(deletedRecords) ? deletedRecords : [];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, DELETED_RECORDS_HEADERS.length).setValues([DELETED_RECORDS_HEADERS]);

  const rows = records.map((record) => DELETED_RECORDS_HEADERS.map((header) => record[header] ?? ''));
  if (rows.length) sheet.getRange(2, 1, rows.length, DELETED_RECORDS_HEADERS.length).setValues(rows);
  sheet.autoResizeColumns(1, DELETED_RECORDS_HEADERS.length);
  return rows.length;
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
    if (String(doc.id).startsWith('sheet-')) return;
    map.set(doc.id, { ...doc, source: doc.source || 'hub-sync-data' });
  });

  return Array.from(map.values());
}

function readTabTotals_(displayValues, rawValues) {
  const displayRows = displayValues.map((row) => row.map((cell) => String(cell || '').trim()));
  const rawRows = rawValues || displayValues;

  for (let r = 0; r < displayRows.length; r += 1) {
    const normalizedRow = displayRows[r].map(normalizeLabel_);
    const hasSummary = normalizedRow.includes('n righe') && normalizedRow.includes('imponibile') && normalizedRow.includes('iva') && normalizedRow.includes('totale');
    if (!hasSummary) continue;

    return {
      movimenti: readValueAfterLabel_(displayRows[r], rawRows[r], 'n righe'),
      imponibile: round2_(readValueAfterLabel_(displayRows[r], rawRows[r], 'imponibile')),
      iva: round2_(readValueAfterLabel_(displayRows[r], rawRows[r], 'iva')),
      totale: round2_(readValueAfterLabel_(displayRows[r], rawRows[r], 'totale')),
    };
  }

  const headerIndex = displayRows.findIndex((row) => row.map(normalizeLabel_).includes('data') && row.map(normalizeLabel_).includes('totale'));
  if (headerIndex >= 0) {
    const headers = displayRows[headerIndex].map(normalizeLabel_);
    const imponibileIndex = headers.findIndex((value) => value === 'imponibile');
    const ivaIndex = headers.findIndex((value) => value === 'iva');
    const totaleIndex = headers.findIndex((value) => value === 'totale');

    let imponibile = 0;
    let iva = 0;
    let totale = 0;
    let movimenti = 0;

    for (let r = headerIndex + 1; r < displayRows.length; r += 1) {
      const hasData = displayRows[r].some((cell) => cell !== '');
      if (!hasData) continue;
      const rowTotal = parseNumber_(displayRows[r][totaleIndex]);
      if (rowTotal === null || rowTotal === 0) continue;
      movimenti += 1;
      imponibile += parseNumber_(displayRows[r][imponibileIndex]) || 0;
      iva += parseNumber_(displayRows[r][ivaIndex]) || 0;
      totale += rowTotal;
    }

    return { imponibile: round2_(imponibile), iva: round2_(iva), totale: round2_(totale), movimenti: Math.max(1, movimenti) };
  }

  return { imponibile: 0, iva: 0, totale: 0, movimenti: 0 };
}

function getNumberAt_(displayRow, rawRow, index) {
  if (index < 0) return 0;
  const rawValue = rawRow && rawRow[index] !== undefined ? rawRow[index] : null;
  const rawParsed = parseNumber_(rawValue);
  if (rawParsed !== null) return rawParsed;
  return parseNumber_(displayRow[index]) || 0;
}

function readValueAfterLabel_(displayRow, rawRow, label) {
  const normalized = displayRow.map(normalizeLabel_);
  const index = normalized.findIndex((cell) => cell === label);
  if (index < 0) return 0;

  for (let c = index + 1; c < displayRow.length; c += 1) {
    const rawValue = rawRow && rawRow[c] !== undefined ? rawRow[c] : displayRow[c];
    const parsed = parseNumber_(rawValue);
    if (parsed !== null) return parsed;
  }

  return 0;
}

function normalizeLabel_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/€/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseNumber_(value) {
  if (value === null || value === undefined || value === '') return null;
  if (Object.prototype.toString.call(value) === '[object Date]') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const text = String(value).trim();
  if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}$/.test(text)) return null;

  const raw = text.replace(/€/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return null;
  const parsed = Number(raw);
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

  let deletedSheet = ss.getSheetByName(DELETED_RECORDS_SHEET);
  if (!deletedSheet) deletedSheet = ss.insertSheet(DELETED_RECORDS_SHEET);
  if (deletedSheet.getLastRow() === 0) deletedSheet.getRange(1, 1, 1, DELETED_RECORDS_HEADERS.length).setValues([DELETED_RECORDS_HEADERS]);
}

function log_(action, note) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SYNC_LOG_SHEET);
  sheet.appendRow([new Date(), action, note]);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
