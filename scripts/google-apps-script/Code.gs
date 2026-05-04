const SPREADSHEET_ID = '1J3fW7BwEF6fAqtXxbKpLdSR5NVVbP2cMeZIHFr7bbao';
const SYNC_DATA_SHEET = 'Hub_Sync_Data';
const SYNC_LOG_SHEET = 'Hub_Sync_Log';
const DELETED_RECORDS_SHEET = 'Deleted_Records';
const DEFAULT_CANTIERE_ID = 'barcelo-roma';
const DEFAULT_CANTIERE_NAME = 'Barcelò Roma';

const SKIP_SHEET_NAMES = new Set([
  'riepilogo',
  'drive_documenti',
  'hub_sync_data',
  'hub_sync_log',
  'deleted_records',
]);

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
    if (action === 'ping' || action === 'health') return json_({ ok: true, parser: 'row-level-v3-official-master', message: 'Google Sheets sync online', spreadsheetId: SPREADSHEET_ID });
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
  SpreadsheetApp.getUi().alert('Hub sync pronto: import riga-per-riga + totali ufficiali da Riepilogo. Pubblica una nuova versione Web App dopo aver salvato.');
}

function buildStoreFromMaster_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const officialMaster = readOfficialMasterSummary_(ss);
  const parsed = readMovementRowsFromTabs_(ss);
  const exportedDocs = readHubSyncData_(ss);
  const mergedDocuments = mergeDocuments_(parsed.documents, exportedDocs);
  const movements = buildMovementsFromDocuments_(mergedDocuments, parsed.movements);
  const rowTotals = mergedDocuments.reduce((acc, doc) => {
    acc.imponibile += Number(doc.imponibile || 0);
    acc.iva += Number(doc.iva || 0);
    acc.totale += Number(doc.totale || 0);
    acc.rows += 1;
    return acc;
  }, { imponibile: 0, iva: 0, totale: 0, rows: 0 });

  const store = {
    documents: mergedDocuments,
    movements,
    photos: [],
    estimates: [],
    notes: [],
    activities: [{
      id: `activity-sync-${Date.now()}`,
      date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      author: 'Google Sheets Sync',
      type: 'sync',
      description: `Importate ${mergedDocuments.length} righe operative da BARCELO_ROMA_master. Totali ufficiali letti dal tab Riepilogo.`,
      entityType: 'google-sheet',
      entityId: SPREADSHEET_ID,
    }],
    source: {
      type: 'google-sheets',
      name: 'BARCELO_ROMA_master',
      spreadsheetId: SPREADSHEET_ID,
      importedAt: new Date().toISOString(),
      parser: 'row-level-v3-official-master',
      mode: 'official-master-totals-plus-row-detail',
      parsedSheets: parsed.parsedSheets,
      skippedSheets: parsed.skippedSheets,
      officialMaster,
      totals: officialMaster.totals,
      categoryTotals: officialMaster.categoryTotals,
      rowTotals,
    },
  };

  log_('IMPORT_TO_SUPABASE_PAYLOAD', `Totale ufficiale master: ${round2_(officialMaster.totals.totale)}; righe operative: ${mergedDocuments.length}; totale righe solo controllo: ${round2_(rowTotals.totale)}; tab letti: ${parsed.parsedSheets.length}`);

  return {
    store,
    summary: {
      parser: 'row-level-v3-official-master',
      documents: mergedDocuments.length,
      movements: movements.length,
      photos: 0,
      estimates: 0,
      officialMaster,
      totals: officialMaster.totals,
      rowTotals,
      parsedSheets: parsed.parsedSheets,
      skippedSheets: parsed.skippedSheets,
    },
  };
}

function readOfficialMasterSummary_(ss) {
  const sheet = ss.getSheetByName('Riepilogo');
  const fallback = {
    sourceSheet: 'Riepilogo',
    officialMaster: true,
    readAt: new Date().toISOString(),
    totals: { imponibile: 0, iva: 0, totale: 0, rows: 0 },
    categoryTotals: [],
  };

  if (!sheet) return fallback;

  const values = sheet.getDataRange().getDisplayValues();
  const flattened = values.flat();
  const totals = { imponibile: 0, iva: 0, totale: 0, rows: 0 };

  for (let i = 0; i < flattened.length; i += 1) {
    const key = normalizeKey_(flattened[i]);
    const next = flattened[i + 1];
    if (key === 'n_tab_principali') totals.rows = parseMoney_(next);
    if (key === 'imponibile_totale_e') totals.imponibile = parseMoney_(next);
    if (key === 'iva_totale_e') totals.iva = parseMoney_(next);
    if (key === 'totale_generale_e') totals.totale = parseMoney_(next);
  }

  const categoryTotals = [];
  const headerInfo = findOfficialSummaryHeader_(values);
  if (headerInfo) {
    for (let r = headerInfo.rowIndex + 1; r < values.length; r += 1) {
      const row = values[r];
      const tab = cleanText_(row[headerInfo.map.tab]);
      if (!tab) continue;

      categoryTotals.push({
        categoria: tab,
        descrizione: cleanText_(row[headerInfo.map.descrizione]),
        movimenti: parseMoney_(row[headerInfo.map.movimenti]),
        imponibile: parseMoney_(row[headerInfo.map.imponibile]),
        iva: parseMoney_(row[headerInfo.map.iva]),
        totale: parseMoney_(row[headerInfo.map.totale]),
        source: 'Riepilogo',
      });
    }
  }

  return {
    sourceSheet: 'Riepilogo',
    officialMaster: true,
    readAt: new Date().toISOString(),
    totals,
    categoryTotals,
  };
}

function findOfficialSummaryHeader_(values) {
  for (let r = 0; r < values.length; r += 1) {
    const headers = values[r].map((cell) => normalizeKey_(cell));
    const tab = headers.indexOf('tab_principale');
    const descrizione = headers.indexOf('descrizione');
    const movimenti = headers.indexOf('n_movimenti');
    const imponibile = headers.indexOf('imponibile_e');
    const iva = headers.indexOf('iva_e');
    const totale = headers.indexOf('totale_e');

    if (tab >= 0 && descrizione >= 0 && movimenti >= 0 && imponibile >= 0 && iva >= 0 && totale >= 0) {
      return { rowIndex: r, map: { tab, descrizione, movimenti, imponibile, iva, totale } };
    }
  }
  return null;
}

function readMovementRowsFromTabs_(ss) {
  const documents = [];
  const movements = [];
  const parsedSheets = [];
  const skippedSheets = [];

  ss.getSheets().forEach((sheet) => {
    const sheetName = sheet.getName();
    const normalizedSheetName = normalizeKey_(sheetName);

    if (shouldSkipSheet_(normalizedSheetName)) {
      skippedSheets.push(sheetName);
      return;
    }

    const range = sheet.getDataRange();
    const displayValues = range.getDisplayValues();
    const rawValues = range.getValues();
    const headerInfo = findMovementHeader_(displayValues);

    if (!headerInfo) {
      skippedSheets.push(sheetName);
      return;
    }

    const before = documents.length;
    for (let r = headerInfo.rowIndex + 1; r < displayValues.length; r += 1) {
      const parsed = parseMovementRow_(displayValues[r], rawValues[r], headerInfo.headers, sheetName, r + 1);
      if (!parsed) continue;
      documents.push(parsed.document);
      movements.push(parsed.movement);
    }

    const importedRows = documents.length - before;
    if (importedRows > 0) parsedSheets.push({ sheetName, importedRows });
    if (importedRows === 0) skippedSheets.push(sheetName);
  });

  return { documents, movements, parsedSheets, skippedSheets };
}

function parseMovementRow_(displayRow, rawRow, headers, sheetName, spreadsheetRowNumber) {
  const row = rowToObject_(headers, displayRow, rawRow);
  const date = normalizeDate_(row.data.raw || row.data.display);
  const documentNumber = cleanText_(row.documento.display || row.documento.raw);
  const description = cleanText_(row.descrizione.display || row.documento.display || row.descrizione.raw || row.documento.raw);
  const supplier = cleanText_(row.fornitore.display || row.fornitore.raw);
  const method = cleanText_(row.metodo.display || row.metodo.raw) || 'Non indicato';
  const rawCategory = cleanText_(row.categoria.display || row.categoria.raw) || 'Extra / Altro';
  const imponibile = parseMoney_(row.imponibile.raw !== '' ? row.imponibile.raw : row.imponibile.display);
  const iva = parseMoney_(row.iva.raw !== '' ? row.iva.raw : row.iva.display);
  const total = parseMoney_(row.totale.raw !== '' ? row.totale.raw : row.totale.display);
  const note = cleanText_(row.note.display || row.note.raw);
  const fileStatus = cleanText_(row.statoFile.display || row.statoFile.raw);
  const fileName = cleanText_(row.nomeFilePrincipale.display || row.nomeFilePrincipale.raw);
  const otherVersions = cleanText_(row.altreVersioni.display || row.altreVersioni.raw);
  const formats = cleanText_(row.formatiDisp.display || row.formatiDisp.raw);
  const drivePath = cleanText_(row.percorsoDriveAtteso.display || row.percorsoDriveAtteso.raw);
  const fileUrl = cleanText_(row.urlFile.display || row.urlFile.raw);

  if (!date && !documentNumber && !description && !supplier && !total && !imponibile && !iva) return null;
  if (!total && !imponibile && !iva && !documentNumber && !description) return null;

  const id = stableId_(['document', sheetName, spreadsheetRowNumber, date, documentNumber, description, supplier, total].join('|'));
  const category = normalizeCategory_(rawCategory);
  const status = normalizeVerificationStatus_(fileStatus);
  const tipoDocumento = inferDocumentType_(row.tipo.display || row.tipo.raw, documentNumber, category, method);
  const computedTotal = total || round2_(imponibile + iva);
  const noteParts = [
    note,
    `Tab: ${sheetName}`,
    rawCategory && rawCategory !== category ? `Categoria originale: ${rawCategory}` : '',
    otherVersions ? `Altre versioni: ${otherVersions}` : '',
    formats ? `Formati: ${formats}` : '',
    fileUrl ? `URL file: ${fileUrl}` : '',
  ].filter(Boolean);

  const document = {
    id,
    cantiereId: DEFAULT_CANTIERE_ID,
    cantiere: DEFAULT_CANTIERE_NAME,
    tipoDocumento,
    fornitore: supplier || 'DA VERIFICARE',
    descrizione: description || documentNumber || 'Movimento Google Sheets',
    numeroDocumento: documentNumber || `${sheetName} riga ${spreadsheetRowNumber}`,
    dataDocumento: date,
    categoria: category,
    imponibile,
    iva,
    totale: computedTotal,
    importoTotale: computedTotal,
    pagamento: method,
    statoVerifica: status,
    stato: String(status).toLowerCase(),
    fileName: fileName || documentNumber || '',
    storagePath: drivePath || '',
    storageBucket: drivePath ? 'documents' : '',
    note: noteParts.join(' · '),
    nota: noteParts.join(' · '),
    caricatoDa: 'Google Sheets import',
    dataCaricamento: new Date().toISOString().slice(0, 10),
    source: 'google-sheets-row-import',
    sheetTab: sheetName,
    movimentiCount: 1,
    updatedAt: new Date().toISOString(),
  };

  const movement = {
    id: `movement-${id}`,
    documentId: id,
    cantiereId: DEFAULT_CANTIERE_ID,
    cantiere: DEFAULT_CANTIERE_NAME,
    data: date,
    descrizione: document.descrizione,
    fornitore: document.fornitore,
    categoria: category,
    tipoDocumento,
    numeroDocumento: document.numeroDocumento,
    imponibile,
    iva,
    totale: computedTotal,
    pagamento: method,
    statoVerifica: status,
    documentoCollegato: fileName || documentNumber || '',
    fileName: fileName || '',
    storagePath: drivePath || '',
    storageBucket: drivePath ? 'documents' : '',
    note: document.note,
    source: 'google-sheets-row-import',
    updatedAt: new Date().toISOString(),
  };

  return { document, movement };
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
    if (doc.source === 'google-sheets-sync') return;
    map.set(doc.id, { ...doc, source: doc.source || 'hub-sync-data' });
  });

  return Array.from(map.values());
}

function buildMovementsFromDocuments_(documents, parsedMovements) {
  const parsedMap = new Map(parsedMovements.map((movement) => [movement.documentId, movement]));
  return documents.map((doc) => parsedMap.get(doc.id) || {
    id: `movement-${doc.id}`,
    documentId: doc.id,
    cantiereId: doc.cantiereId || DEFAULT_CANTIERE_ID,
    cantiere: doc.cantiere || DEFAULT_CANTIERE_NAME,
    data: doc.dataDocumento || '',
    descrizione: doc.descrizione || doc.tipoDocumento || 'Movimento contabile',
    fornitore: doc.fornitore || 'Non indicato',
    categoria: doc.categoria || 'Extra / Altro',
    tipoDocumento: doc.tipoDocumento || 'Altro',
    numeroDocumento: doc.numeroDocumento || doc.fileName || doc.id,
    imponibile: Number(doc.imponibile || 0),
    iva: Number(doc.iva || 0),
    totale: Number(doc.totale || doc.importoTotale || 0),
    pagamento: doc.pagamento || 'Non indicato',
    statoVerifica: doc.statoVerifica || 'Da verificare',
    documentoCollegato: doc.fileName || doc.numeroDocumento || '',
    fileName: doc.fileName || '',
    storagePath: doc.storagePath || '',
    storageBucket: doc.storageBucket || '',
    note: doc.note || doc.nota || '',
    source: doc.source || 'hub-sync-data',
  });
}

function findMovementHeader_(displayValues) {
  for (let rowIndex = 0; rowIndex < Math.min(displayValues.length, 20); rowIndex += 1) {
    const normalizedHeaders = displayValues[rowIndex].map((cell) => normalizeHeader_(cell));
    const hasMainHeaders = ['data', 'documento', 'descrizione', 'fornitore', 'categoria', 'totale'].every((key) => normalizedHeaders.includes(key));
    if (!hasMainHeaders) continue;

    return {
      rowIndex,
      headers: normalizedHeaders,
    };
  }
  return null;
}

function rowToObject_(headers, displayRow, rawRow) {
  const emptyCell = { display: '', raw: '' };
  return headers.reduce((acc, header, index) => {
    if (!header) return acc;
    acc[header] = {
      display: displayRow[index] !== undefined ? displayRow[index] : '',
      raw: rawRow[index] !== undefined ? rawRow[index] : '',
    };
    return acc;
  }, {
    data: emptyCell,
    documento: emptyCell,
    tipo: emptyCell,
    descrizione: emptyCell,
    fornitore: emptyCell,
    metodo: emptyCell,
    categoria: emptyCell,
    imponibile: emptyCell,
    iva: emptyCell,
    totale: emptyCell,
    note: emptyCell,
    statoFile: emptyCell,
    nomeFilePrincipale: emptyCell,
    altreVersioni: emptyCell,
    formatiDisp: emptyCell,
    percorsoDriveAtteso: emptyCell,
    urlFile: emptyCell,
  });
}

function normalizeHeader_(value) {
  const header = normalizeKey_(value);
  const map = {
    data: 'data',
    data_inizio: 'data',
    documento: 'documento',
    tipo: 'tipo',
    descrizione: 'descrizione',
    fornitore: 'fornitore',
    metodo: 'metodo',
    metodo_periodo: 'metodo',
    categoria: 'categoria',
    imponibile: 'imponibile',
    imponibile_e: 'imponibile',
    iva: 'iva',
    iva_e: 'iva',
    totale: 'totale',
    totale_e: 'totale',
    note: 'note',
    stato_file: 'statoFile',
    nome_file_principale: 'nomeFilePrincipale',
    altre_versioni: 'altreVersioni',
    formati_disp: 'formatiDisp',
    percorso_drive_atteso: 'percorsoDriveAtteso',
    url_file: 'urlFile',
    url_file_incolla_link_drive: 'urlFile',
  };
  return map[header] || header;
}

function shouldSkipSheet_(normalizedSheetName) {
  if (SKIP_SHEET_NAMES.has(normalizedSheetName)) return true;
  if (normalizedSheetName.startsWith('dett_')) return true;
  if (normalizedSheetName.includes('riepilogo')) return true;
  if (normalizedSheetName.includes('sync')) return true;
  return false;
}

function normalizeCategory_(value) {
  const normalized = normalizeKey_(value);
  if (!normalized) return 'Extra / Altro';
  if (normalized.includes('vitto') || normalized.includes('pasti') || normalized.includes('supermercato')) return 'Vitto';
  if (normalized.includes('alloggio') || normalized.includes('alloggi') || normalized.includes('affitto') || normalized.includes('booking')) return 'Alloggi';
  if (normalized.includes('rifiuti') || normalized.includes('fir') || normalized.includes('container')) return 'FIR / Rifiuti';
  if (normalized.includes('bonifico') || normalized.includes('pagamento') || normalized.includes('commission')) return 'Bonifici / Pagamenti';
  if (normalized.includes('noleggi') || normalized.includes('noleggio') || normalized.includes('servizi')) return 'Noleggi / Servizi';
  if (normalized.includes('manodopera')) return 'Manodopera';
  if (normalized.includes('material') || normalized.includes('ferro') || normalized.includes('cemento') || normalized.includes('muratura') || normalized.includes('cartongesso') || normalized.includes('piscina') || normalized.includes('soffitti') || normalized.includes('irrigazione') || normalized.includes('aiuole')) return 'Materiali';
  return cleanText_(value) || 'Extra / Altro';
}

function inferDocumentType_(typeValue, documentNumber, category, method) {
  const source = normalizeKey_(`${typeValue} ${documentNumber} ${category} ${method}`);
  if (source.includes('bonifico')) return 'Bonifico';
  if (source.includes('fir')) return 'FIR';
  if (source.includes('ricevuta')) return 'Ricevuta';
  if (source.includes('preventivo')) return 'Preventivo';
  if (source.includes('nota_credito') || source.includes('nota credito')) return 'Nota credito';
  if (source.includes('fattura') || source.includes('_b') || source.includes('docc') || /\d+\s*b/.test(source)) return 'Fattura';
  return cleanText_(typeValue) || 'Movimento';
}

function normalizeVerificationStatus_(value) {
  const normalized = normalizeKey_(value);
  if (normalized === 'ok' || normalized === 'confermato') return 'Confermato';
  if (normalized === 'mancante' || normalized === 'incompleto') return 'Incompleto';
  if (normalized.includes('duplic')) return 'Possibile duplicato';
  return 'Da verificare';
}

function normalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = cleanText_(value);
  if (!text) return '';
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return text.slice(0, 10);
}

function parseMoney_(value) {
  if (typeof value === 'number') return round2_(value);
  const text = cleanText_(value);
  if (!text) return 0;
  const normalized = text
    .replace(/€/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? round2_(number) : 0;
}

function cleanText_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeKey_(value) {
  return cleanText_(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/€/g, 'e')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function stableId_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  return digest
    .slice(0, 12)
    .map((byte) => (byte + 256).toString(16).slice(-2))
    .join('');
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
