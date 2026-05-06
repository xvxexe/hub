export const DRIVE_AUTOMATION_CONFIG = {
  cantiere: 'Barcelo Roma',
  masterSpreadsheetId: '1J3fW7BwEF6fAqtXxbKpLdSR5NVVbP2cMeZIHFr7bbao',
  barceloFolderId: '1JGJ1MrsYYFNu60EjuQz6BTYUynfJJ_gq',
  rawDocumentsFolderId: '17prKA78uQ30sAIkuMN-cuRLYTCB2MmD-',
  masterTab: 'Drive_Documenti',
  rawTab: 'Drive_Raw_Files',
  planTab: 'Drive_Automation_Plan',
  logTab: 'Drive_Automation_Log',
}

export const DRIVE_AUTOMATION_SCRIPT = String.raw`const DRIVE_AUTOMATION_CONFIG = {
  MASTER_SPREADSHEET_ID: '1J3fW7BwEF6fAqtXxbKpLdSR5NVVbP2cMeZIHFr7bbao',
  BARCELO_FOLDER_ID: '1JGJ1MrsYYFNu60EjuQz6BTYUynfJJ_gq',
  RAW_DOCUMENTS_FOLDER_ID: '17prKA78uQ30sAIkuMN-cuRLYTCB2MmD-',
  MASTER_TAB: 'Drive_Documenti',
  RAW_TAB: 'Drive_Raw_Files',
  PLAN_TAB: 'Drive_Automation_Plan',
  LOG_TAB: 'Drive_Automation_Log',
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('EuropaService Drive')
    .addItem('Sistema automaticamente documenti sicuri', 'runFullAutoDriveAutomation')
    .addSeparator()
    .addItem('1. Setup schede automazione', 'setupDriveDocumentAutomation')
    .addItem('2. Scannerizza cartella Documenti', 'scanBarceloDocumenti')
    .addItem('3. Genera piano da Drive_Documenti', 'buildPlanFromDriveDocumenti')
    .addItem('Auto-approva match sicuri', 'autoApproveSafeDriveAutomation')
    .addSeparator()
    .addItem('Dry-run righe approvate', 'dryRunApprovedDriveAutomation')
    .addItem('Applica righe approvate', 'applyApprovedDriveAutomation')
    .addToUi();
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  return driveAutomationResponse_(handleDriveAutomationAction_(params.action || 'status', params));
}

function doPost(e) {
  let payload = {};
  try {
    payload = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  } catch (error) {
    payload = { action: 'error', error: 'JSON non valido: ' + error.message };
  }
  return driveAutomationResponse_(handleDriveAutomationAction_(payload.action || 'status', payload));
}

function handleDriveAutomationAction_(action, payload) {
  try {
    if (action === 'status') return { ok: true, message: 'Automazione Drive pronta', config: DRIVE_AUTOMATION_CONFIG };
    if (action === 'setup') return setupDriveDocumentAutomation();
    if (action === 'scan') return scanBarceloDocumenti();
    if (action === 'buildPlan') return buildPlanFromDriveDocumenti();
    if (action === 'autoApproveSafe') return autoApproveSafeDriveAutomation();
    if (action === 'dryRun') return dryRunApprovedDriveAutomation();
    if (action === 'applyApproved') return applyApprovedDriveAutomation();
    if (action === 'runFullAuto') return runFullAutoDriveAutomation();
    return { ok: false, error: 'Azione non riconosciuta: ' + action };
  } catch (error) {
    logDriveAutomation_('ERRORE', action, '', error.message);
    return { ok: false, action: action, error: error.message };
  }
}

function driveAutomationResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function runFullAutoDriveAutomation() {
  const setup = setupDriveDocumentAutomation();
  const scan = scanBarceloDocumenti();
  const plan = buildPlanFromDriveDocumenti();
  const approval = autoApproveSafeDriveAutomation();
  const dryRun = dryRunApprovedDriveAutomation();
  const apply = applyApprovedDriveAutomation();
  const needsReview = countDriveAutomationNeedsReview_();

  const message = [
    'Automatico completato',
    scan.scannedFiles + ' file letti',
    plan.planRows + ' righe piano',
    approval.autoApproved + ' match sicuri approvati',
    apply.success + ' applicati',
    needsReview + ' da controllare'
  ].join(' · ');

  logDriveAutomation_('OK', 'runFullAuto', '', message);
  return {
    ok: true,
    mode: 'full_auto_safe_matches_only',
    message: message,
    setup: setup,
    scannedFiles: scan.scannedFiles || 0,
    planRows: plan.planRows || 0,
    autoApproved: approval.autoApproved || 0,
    dryRun: dryRun,
    processed: apply.processed || 0,
    success: apply.success || 0,
    failed: apply.failed || 0,
    needsReview: needsReview,
    apply: apply,
  };
}

function setupDriveDocumentAutomation() {
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.RAW_TAB, [
    'File ID', 'Nome attuale', 'MIME type', 'Estensione', 'Dimensione byte',
    'Creato il', 'Aggiornato il', 'Percorso attuale', 'URL', 'Note'
  ]);
  ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.PLAN_TAB, [
    'Esegui', 'Stato match', 'Riga master', 'Data', 'Area/tab', 'Documento master',
    'Fornitore', 'Totale', 'File ID', 'Nome attuale', 'Nome nuovo',
    'Percorso target', 'Azione', 'URL dopo spostamento', 'Note'
  ]);
  ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.LOG_TAB, [
    'Timestamp', 'Livello', 'Azione', 'File ID', 'Messaggio'
  ]);
  logDriveAutomation_('OK', 'setup', '', 'Schede automazione pronte');
  return { ok: true, message: 'Schede Drive_Raw_Files, Drive_Automation_Plan e Drive_Automation_Log pronte.' };
}

function scanBarceloDocumenti() {
  setupDriveDocumentAutomation();
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.RAW_TAB);
  const root = DriveApp.getFolderById(DRIVE_AUTOMATION_CONFIG.RAW_DOCUMENTS_FOLDER_ID);
  const rows = [];
  scanFolder_(root, 'EuropaService/Barcelo Roma/Documenti', rows);
  replaceSheetData_(sheet, rows);
  logDriveAutomation_('OK', 'scan', '', 'File scannerizzati: ' + rows.length);
  return { ok: true, scannedFiles: rows.length, tab: DRIVE_AUTOMATION_CONFIG.RAW_TAB };
}

function buildPlanFromDriveDocumenti() {
  setupDriveDocumentAutomation();
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const masterSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.MASTER_TAB);
  const rawSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.RAW_TAB);
  const planSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.PLAN_TAB);

  if (!masterSheet) throw new Error('Tab mancante: ' + DRIVE_AUTOMATION_CONFIG.MASTER_TAB);
  if (rawSheet.getLastRow() < 2) scanBarceloDocumenti();

  const masterValues = masterSheet.getDataRange().getDisplayValues();
  const rawValues = rawSheet.getDataRange().getDisplayValues();
  const rawFiles = rawValues.slice(1).map(function(row) {
    return {
      id: row[0],
      name: row[1],
      mimeType: row[2],
      extension: row[3],
      path: row[7],
      url: row[8],
      normalizedName: normalizeKey_(row[1]),
    };
  }).filter(function(file) { return file.id; });

  const rows = [];
  for (let i = 1; i < masterValues.length; i += 1) {
    const row = masterValues[i];
    const data = row[0];
    const area = row[1];
    const documento = row[2];
    const fornitore = row[3];
    const totale = row[4];
    const statoFile = row[5];
    const nomePrincipale = row[6];
    const altreVersioni = row[7];
    const percorsoAtteso = row[9];
    const urlEsistente = row[10];

    if (!documento && !nomePrincipale && !percorsoAtteso) continue;

    const candidates = candidateNames_(nomePrincipale, altreVersioni);
    const match = findRawFileMatch_(rawFiles, candidates);
    const nomeNuovo = nomePrincipale || buildSafeName_(data, fornitore, documento, totale, area, match ? match.extension : 'pdf');
    const percorsoTarget = percorsoAtteso || ('EuropaService/Barcelo Roma/' + (area || 'Da_classificare') + '/' + nomeNuovo);
    const alreadyLinked = Boolean(urlEsistente);
    const manualReason = match ? 'Match automatico per nome file' : 'Compilare File ID dopo controllo visivo del documento';
    const statoMatch = alreadyLinked ? 'GIA_COLLEGATO' : (match ? 'AUTO_MATCH' : 'MANUALE');
    const action = alreadyLinked ? 'NESSUNA' : (match ? 'RINOMINA_SPOSTA' : 'DA_COMPILARE');

    rows.push([
      false,
      statoMatch,
      i + 1,
      data,
      area,
      documento,
      fornitore,
      totale,
      match ? match.id : '',
      match ? match.name : '',
      nomeNuovo,
      percorsoTarget,
      action,
      urlEsistente || '',
      (statoFile ? 'Stato master: ' + statoFile + '. ' : '') + manualReason,
    ]);
  }

  replaceSheetData_(planSheet, rows);
  logDriveAutomation_('OK', 'buildPlan', '', 'Righe piano generate: ' + rows.length);
  return { ok: true, planRows: rows.length, tab: DRIVE_AUTOMATION_CONFIG.PLAN_TAB };
}

function autoApproveSafeDriveAutomation() {
  setupDriveDocumentAutomation();
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const planSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.PLAN_TAB);
  const values = planSheet.getDataRange().getValues();
  let autoApproved = 0;
  let needsReview = 0;

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    const status = String(row[1] || '').trim();
    const fileId = String(row[8] || '').trim();
    const newName = String(row[10] || '').trim();
    const targetPath = String(row[11] || '').trim();
    const action = String(row[12] || '').trim();
    const urlAfter = String(row[13] || '').trim();

    const safe = status === 'AUTO_MATCH' && fileId && newName && targetPath && action === 'RINOMINA_SPOSTA' && !urlAfter;
    if (safe) {
      planSheet.getRange(i + 1, 1).setValue(true);
      planSheet.getRange(i + 1, 15).setValue('AUTO-APPROVATO: match esatto per nome file. Verrà verificato anche dal dry-run.');
      autoApproved += 1;
    } else if (status !== 'GIA_COLLEGATO') {
      planSheet.getRange(i + 1, 1).setValue(false);
      needsReview += 1;
    }
  }

  logDriveAutomation_('OK', 'autoApproveSafe', '', 'Auto-approvati: ' + autoApproved + '. Da controllare: ' + needsReview);
  return { ok: true, autoApproved: autoApproved, needsReview: needsReview, tab: DRIVE_AUTOMATION_CONFIG.PLAN_TAB };
}

function dryRunApprovedDriveAutomation() {
  return applyDriveAutomationPlan_(true);
}

function applyApprovedDriveAutomation() {
  return applyDriveAutomationPlan_(false);
}

function applyDriveAutomationPlan_(dryRun) {
  setupDriveDocumentAutomation();
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const planSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.PLAN_TAB);
  const masterSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.MASTER_TAB);
  const values = planSheet.getDataRange().getValues();
  const results = [];

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    const execute = row[0] === true || String(row[0]).toUpperCase() === 'TRUE' || String(row[0]).toUpperCase() === 'SI';
    if (!execute) continue;

    const masterRow = Number(row[2]);
    const fileId = String(row[8] || '').trim();
    const newName = String(row[10] || '').trim();
    const targetPath = String(row[11] || '').trim();
    const action = String(row[12] || '').trim();

    if (!fileId || !newName || !targetPath) {
      results.push({ row: i + 1, ok: false, error: 'File ID, Nome nuovo o Percorso target mancante.' });
      continue;
    }

    if (action !== 'RINOMINA_SPOSTA' && action !== 'FORZA_RINOMINA_SPOSTA') {
      results.push({ row: i + 1, ok: false, error: 'Azione non eseguibile: ' + action });
      continue;
    }

    const file = DriveApp.getFileById(fileId);
    const targetFolder = ensureTargetFolder_(targetPath, newName);
    const duplicate = findDifferentFileWithName_(targetFolder, newName, fileId);

    if (duplicate && action !== 'FORZA_RINOMINA_SPOSTA') {
      const message = 'Duplicato già presente nella cartella target: ' + duplicate.getUrl();
      planSheet.getRange(i + 1, 1).setValue(false);
      planSheet.getRange(i + 1, 2).setValue('DUPLICATO_TARGET');
      planSheet.getRange(i + 1, 15).setValue(message);
      logDriveAutomation_('WARN', dryRun ? 'dryRun' : 'apply', fileId, message);
      results.push({ row: i + 1, ok: false, error: message });
      continue;
    }

    if (!dryRun) {
      file.setName(newName);
      file.moveTo(targetFolder);
      const url = file.getUrl();
      planSheet.getRange(i + 1, 1).setValue(false);
      planSheet.getRange(i + 1, 2).setValue('SPOSTATO_OK');
      planSheet.getRange(i + 1, 14).setValue(url);
      planSheet.getRange(i + 1, 15).setValue('Applicato il ' + new Date().toISOString());
      if (masterSheet && masterRow > 1) {
        masterSheet.getRange(masterRow, 6).setValue('OK');
        masterSheet.getRange(masterRow, 11).setValue(url);
      }
      logDriveAutomation_('OK', 'apply', fileId, 'Rinominato/spostato: ' + newName);
      results.push({ row: i + 1, ok: true, url: url, dryRun: false });
    } else {
      const message = 'DRY-RUN OK: ' + file.getName() + ' -> ' + newName;
      planSheet.getRange(i + 1, 15).setValue(message);
      logDriveAutomation_('OK', 'dryRun', fileId, message);
      results.push({ row: i + 1, ok: true, dryRun: true, message: message });
    }
  }

  return {
    ok: true,
    dryRun: dryRun,
    processed: results.length,
    success: results.filter(function(item) { return item.ok; }).length,
    failed: results.filter(function(item) { return !item.ok; }).length,
    results: results.slice(0, 50),
  };
}

function countDriveAutomationNeedsReview_() {
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const planSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.PLAN_TAB);
  if (!planSheet || planSheet.getLastRow() < 2) return 0;
  const values = planSheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < values.length; i += 1) {
    const status = String(values[i][1] || '').trim();
    const action = String(values[i][12] || '').trim();
    if (status !== 'GIA_COLLEGATO' && status !== 'SPOSTATO_OK' && action !== 'NESSUNA') count += 1;
  }
  return count;
}

function scanFolder_(folder, path, rows) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    rows.push([
      file.getId(),
      name,
      file.getMimeType(),
      extensionFromName_(name),
      file.getSize(),
      formatDateTime_(file.getDateCreated()),
      formatDateTime_(file.getLastUpdated()),
      path,
      file.getUrl(),
      '',
    ]);
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const child = folders.next();
    scanFolder_(child, path + '/' + child.getName(), rows);
  }
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const empty = current.every(function(value) { return value === ''; });
  if (empty || current.join('|') !== headers.join('|')) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function replaceSheetData_(sheet, rows) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.autoResizeColumns(1, Math.min(sheet.getMaxColumns(), 15));
}

function candidateNames_(mainName, alternatives) {
  const names = [];
  if (mainName) names.push(mainName);
  if (alternatives) {
    String(alternatives).split(',').forEach(function(item) {
      const trimmed = item.trim();
      if (trimmed) names.push(trimmed);
    });
  }
  return names.map(normalizeKey_).filter(Boolean);
}

function findRawFileMatch_(rawFiles, candidates) {
  if (!candidates.length) return null;
  return rawFiles.find(function(file) { return candidates.indexOf(file.normalizedName) !== -1; }) || null;
}

function ensureTargetFolder_(targetPath, newName) {
  const parts = String(targetPath).split('/').map(function(part) { return part.trim(); }).filter(Boolean);
  if (parts.length && normalizeKey_(parts[parts.length - 1]) === normalizeKey_(newName)) parts.pop();
  if (parts.length && /\.[a-z0-9]{2,5}$/i.test(parts[parts.length - 1])) parts.pop();

  const normalizedParts = parts.map(normalizeKey_);
  const barceloIndex = normalizedParts.lastIndexOf(normalizeKey_('Barcelo Roma'));
  const relativeParts = barceloIndex >= 0 ? parts.slice(barceloIndex + 1) : parts;

  let folder = DriveApp.getFolderById(DRIVE_AUTOMATION_CONFIG.BARCELO_FOLDER_ID);
  relativeParts.forEach(function(part) {
    if (!part || normalizeKey_(part) === normalizeKey_('EuropaService') || normalizeKey_(part) === normalizeKey_('Barcelo Roma')) return;
    const existing = folder.getFoldersByName(part);
    folder = existing.hasNext() ? existing.next() : folder.createFolder(part);
  });
  return folder;
}

function findDifferentFileWithName_(folder, name, currentFileId) {
  const files = folder.getFilesByName(name);
  while (files.hasNext()) {
    const candidate = files.next();
    if (candidate.getId() !== currentFileId) return candidate;
  }
  return null;
}

function logDriveAutomation_(level, action, fileId, message) {
  try {
    const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
    const sheet = ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.LOG_TAB, ['Timestamp', 'Livello', 'Azione', 'File ID', 'Messaggio']);
    sheet.appendRow([new Date(), level, action, fileId, message]);
  } catch (error) {
    // Evita loop di errore se il log non è disponibile.
  }
}

function buildSafeName_(date, supplier, documentName, total, area, extension) {
  const cleanDate = String(date || '').slice(0, 10) || 'DATA-DA-VERIFICARE';
  const base = [cleanDate, supplier, documentName, total, area]
    .filter(Boolean)
    .join('_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 150);
  const safeExtension = extension ? String(extension).replace(/^\./, '') : 'pdf';
  return base + '.' + safeExtension;
}

function extensionFromName_(name) {
  const match = String(name || '').match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? match[1].toLowerCase() : '';
}

function normalizeKey_(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function formatDateTime_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}`

export function buildDocumentAutomationRows(documents = []) {
  return documents.map((document) => {
    const date = formatIsoDate(document.dataDocumento ?? document.data ?? document.createdAt)
    const area = document.area
      ?? document.tab
      ?? document.sheetName
      ?? document.lavorazione
      ?? document.categoria
      ?? 'Da_classificare'
    const documentLabel = document.numeroDocumento
      ?? document.documento
      ?? document.fileName
      ?? document.descrizione
      ?? document.id
    const extension = extensionFromFileName(document.fileName) || defaultExtensionForType(document.tipoDocumento)
    const suggestedName = buildSafeFileName([
      date,
      document.tipoDocumento,
      document.fornitore,
      documentLabel,
      formatAmountForFileName(document.totale ?? document.importoTotale),
    ], extension)
    const targetPath = `EuropaService/Barcelo Roma/${sanitizePathPart(area)}/${suggestedName}`
    const hasDriveLink = Boolean(
      document.driveUrl
        || document.url
        || document.fileUrl
        || document.storagePath
        || document.documentoCollegato,
    )

    return {
      id: document.id,
      date,
      area,
      documentLabel,
      supplier: document.fornitore ?? 'DA VERIFICARE',
      total: Number(document.totale ?? document.importoTotale ?? 0),
      currentFileName: document.fileName ?? document.numeroDocumento ?? '',
      suggestedName,
      targetPath,
      status: hasDriveLink ? 'COLLEGATO' : 'DA COLLEGARE',
      action: hasDriveLink ? 'NESSUNA' : 'RINOMINA_SPOSTA',
    }
  })
}

export function getDriveAutomationStats(rows = []) {
  const missing = rows.filter((row) => row.status === 'DA COLLEGARE')
  const linked = rows.filter((row) => row.status === 'COLLEGATO')
  const areas = new Set(rows.map((row) => row.area).filter(Boolean))

  return {
    total: rows.length,
    missing: missing.length,
    linked: linked.length,
    areas: areas.size,
  }
}

export function buildPlanTsv(rows = []) {
  const headers = [
    'Esegui',
    'Stato match',
    'Riga master',
    'Data',
    'Area/tab',
    'Documento master',
    'Fornitore',
    'Totale',
    'File ID',
    'Nome attuale',
    'Nome nuovo',
    'Percorso target',
    'Azione',
    'URL dopo spostamento',
    'Note',
  ]

  const body = rows.map((row) => [
    'FALSE',
    row.status === 'COLLEGATO' ? 'GIA_COLLEGATO' : 'DA_MATCHARE',
    '',
    row.date,
    row.area,
    row.documentLabel,
    row.supplier,
    formatItalianAmount(row.total),
    '',
    row.currentFileName,
    row.suggestedName,
    row.targetPath,
    row.action,
    '',
    row.status === 'COLLEGATO' ? 'Documento già collegato nello store' : 'Inserire File ID dopo controllo visivo del file Drive',
  ])

  return [headers, ...body]
    .map((row) => row.map(escapeTsvCell).join('\t'))
    .join('\n')
}

export async function callDriveAutomationEndpoint(endpoint, action, payload = {}) {
  const cleanEndpoint = endpoint?.trim()
  if (!cleanEndpoint) {
    return { ok: false, error: 'Endpoint Apps Script non configurato.' }
  }

  const response = await fetch(cleanEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  })

  const text = await response.text()
  try {
    const json = text ? JSON.parse(text) : {}
    if (!response.ok || json.ok === false) {
      return { ok: false, error: json.error ?? `Errore Apps Script ${response.status}`, raw: json }
    }
    return json
  } catch {
    return {
      ok: false,
      error: text || `Risposta Apps Script non JSON (${response.status})`,
    }
  }
}

function buildSafeFileName(parts, extension) {
  const base = parts
    .filter(Boolean)
    .join('_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 150)

  const ext = extension ? extension.replace(/^\./, '').toLowerCase() : 'pdf'
  return `${base || 'documento_da_verificare'}.${ext}`
}

function sanitizePathPart(value) {
  return String(value ?? 'Da_classificare')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '_') || 'Da_classificare'
}

function extensionFromFileName(fileName) {
  const match = String(fileName ?? '').match(/\.([a-z0-9]{2,5})$/i)
  return match?.[1]?.toLowerCase() ?? ''
}

function defaultExtensionForType(type) {
  if (type === 'Foto' || type === 'Scontrino') return 'jpg'
  return 'pdf'
}

function formatIsoDate(value) {
  if (!value) return 'DATA-DA-VERIFICARE'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

function formatAmountForFileName(value) {
  const amount = Number(value || 0)
  if (!amount) return ''
  return amount.toFixed(2).replace('.', '-')
}

function formatItalianAmount(value) {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function escapeTsvCell(value) {
  return String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim()
}
