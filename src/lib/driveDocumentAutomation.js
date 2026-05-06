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
  LOG_TAB: 'Drive_Automation_Log'
};

const RAW_HEADERS = [
  'File ID', 'Nome attuale', 'MIME type', 'Estensione', 'Dimensione byte',
  'Creato il', 'Aggiornato il', 'Percorso attuale', 'URL', 'OCR stato',
  'Data estratta', 'Fornitore estratto', 'Totale estratto', 'Numero doc estratto',
  'Confidenza OCR', 'Testo estratto breve', 'Note'
];

const PLAN_HEADERS = [
  'Esegui', 'Stato match', 'Score', 'Riga master', 'Data master', 'Area/tab',
  'Documento master', 'Fornitore master', 'Totale master', 'File ID', 'Nome attuale',
  'Nome nuovo', 'Percorso target', 'Azione', 'URL dopo spostamento', 'Dati estratti', 'Note'
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('EuropaService Drive')
    .addItem('Sistema automaticamente documenti sicuri', 'runFullAutoDriveAutomation')
    .addSeparator()
    .addItem('Setup schede automazione', 'setupDriveDocumentAutomation')
    .addItem('Scannerizza + leggi OCR', 'scanBarceloDocumenti')
    .addItem('Genera piano intelligente', 'buildPlanFromDriveDocumenti')
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
    if (action === 'status') return { ok: true, message: 'Automazione OCR Drive pronta', config: DRIVE_AUTOMATION_CONFIG };
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
  return ContentService.createTextOutput(JSON.stringify(payload, null, 2)).setMimeType(ContentService.MimeType.JSON);
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
    'Automatico OCR completato',
    scan.scannedFiles + ' file letti',
    scan.ocrOk + ' OCR ok',
    plan.planRows + ' righe piano',
    approval.autoApproved + ' auto-approvati',
    apply.success + ' applicati',
    needsReview + ' da controllare'
  ].join(' · ');

  logDriveAutomation_('OK', 'runFullAuto', '', message);
  return {
    ok: true,
    mode: 'ocr_full_auto_safe_matches_only',
    message: message,
    setup: setup,
    scannedFiles: scan.scannedFiles || 0,
    ocrOk: scan.ocrOk || 0,
    ocrFailed: scan.ocrFailed || 0,
    planRows: plan.planRows || 0,
    autoApproved: approval.autoApproved || 0,
    dryRun: dryRun,
    processed: apply.processed || 0,
    success: apply.success || 0,
    failed: apply.failed || 0,
    needsReview: needsReview,
    apply: apply
  };
}

function setupDriveDocumentAutomation() {
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.RAW_TAB, RAW_HEADERS);
  ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.PLAN_TAB, PLAN_HEADERS);
  ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.LOG_TAB, ['Timestamp', 'Livello', 'Azione', 'File ID', 'Messaggio']);
  logDriveAutomation_('OK', 'setup', '', 'Schede automazione OCR pronte');
  return { ok: true, message: 'Schede OCR pronte.' };
}

function scanBarceloDocumenti() {
  setupDriveDocumentAutomation();
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.RAW_TAB);
  const root = DriveApp.getFolderById(DRIVE_AUTOMATION_CONFIG.RAW_DOCUMENTS_FOLDER_ID);
  const rows = [];
  scanFolder_(root, 'EuropaService/Barcelo Roma/Documenti', rows);

  let ocrOk = 0;
  let ocrFailed = 0;
  const enrichedRows = rows.map(function(row) {
    const fileId = row[0];
    try {
      const text = extractTextFromDriveFile_(fileId);
      const extracted = extractDocumentFields_(text, row[1]);
      ocrOk += extracted.text ? 1 : 0;
      if (!extracted.text) ocrFailed += 1;
      return row.concat([
        extracted.text ? 'OK' : 'VUOTO',
        extracted.date || '',
        extracted.supplier || '',
        extracted.total || '',
        extracted.documentNumber || '',
        extracted.confidence || 0,
        truncate_(extracted.text, 900),
        extracted.note || ''
      ]);
    } catch (error) {
      ocrFailed += 1;
      return row.concat(['ERRORE', '', '', '', '', 0, '', error.message]);
    }
  });

  replaceSheetData_(sheet, enrichedRows);
  logDriveAutomation_('OK', 'scan+ocr', '', 'File: ' + rows.length + '. OCR ok: ' + ocrOk + '. OCR errori/vuoti: ' + ocrFailed);
  return { ok: true, scannedFiles: rows.length, ocrOk: ocrOk, ocrFailed: ocrFailed, tab: DRIVE_AUTOMATION_CONFIG.RAW_TAB };
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
      ocrStatus: row[9],
      extractedDate: row[10],
      extractedSupplier: row[11],
      extractedTotal: parseAmount_(row[12]),
      extractedDocumentNumber: row[13],
      ocrConfidence: Number(row[14] || 0),
      text: row[15] || '',
      note: row[16] || '',
      normalizedName: normalizeKey_(row[1])
    };
  }).filter(function(file) { return file.id; });

  const rows = [];
  for (let i = 1; i < masterValues.length; i += 1) {
    const master = parseMasterRow_(masterValues[i], i + 1);
    if (!master.documentName && !master.mainFileName && !master.expectedPath) continue;

    const alreadyLinked = Boolean(master.url);
    const match = alreadyLinked ? null : findBestFileMatch_(rawFiles, master);
    const chosenFile = match ? match.file : null;
    const extension = chosenFile ? chosenFile.extension : extensionFromName_(master.mainFileName) || 'pdf';
    const newName = master.mainFileName || buildSafeName_(master.date, master.supplier, master.documentName, master.total, master.area, extension);
    const targetPath = master.expectedPath || ('EuropaService/Barcelo Roma/' + (master.area || 'Da_classificare') + '/' + newName);

    let status = 'MANUALE';
    let action = 'DA_CONTROLLARE';
    let note = 'Nessun match sicuro. Controllare manualmente.';
    let score = 0;

    if (alreadyLinked) {
      status = 'GIA_COLLEGATO';
      action = 'NESSUNA';
      note = 'Documento già collegato nel master.';
    } else if (match) {
      score = match.score;
      if (match.score >= 80 && match.safe) {
        status = 'OCR_AUTO_MATCH';
        action = 'RINOMINA_SPOSTA';
        note = 'Match OCR sicuro: ' + match.reason;
      } else if (match.score >= 55) {
        status = 'OCR_PROBABILE';
        action = 'DA_CONTROLLARE';
        note = 'Match probabile ma non applicato automaticamente: ' + match.reason;
      } else {
        status = 'MANUALE';
        action = 'DA_CONTROLLARE';
        note = 'Score basso: ' + match.reason;
      }
    }

    rows.push([
      false,
      status,
      score,
      master.rowNumber,
      master.date,
      master.area,
      master.documentName,
      master.supplier,
      master.totalRaw,
      chosenFile ? chosenFile.id : '',
      chosenFile ? chosenFile.name : '',
      newName,
      targetPath,
      action,
      master.url || '',
      chosenFile ? buildExtractedSummary_(chosenFile) : '',
      note
    ]);
  }

  replaceSheetData_(planSheet, rows);
  logDriveAutomation_('OK', 'buildPlanOCR', '', 'Righe piano generate: ' + rows.length);
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
    const score = Number(row[2] || 0);
    const fileId = String(row[9] || '').trim();
    const newName = String(row[11] || '').trim();
    const targetPath = String(row[12] || '').trim();
    const action = String(row[13] || '').trim();
    const urlAfter = String(row[14] || '').trim();

    const safe = status === 'OCR_AUTO_MATCH' && score >= 80 && fileId && newName && targetPath && action === 'RINOMINA_SPOSTA' && !urlAfter;
    if (safe) {
      planSheet.getRange(i + 1, 1).setValue(true);
      planSheet.getRange(i + 1, 17).setValue('AUTO-APPROVATO: score ' + score + '. Verrà verificato anche dal dry-run.');
      autoApproved += 1;
    } else if (status !== 'GIA_COLLEGATO' && status !== 'SPOSTATO_OK') {
      planSheet.getRange(i + 1, 1).setValue(false);
      needsReview += 1;
    }
  }

  logDriveAutomation_('OK', 'autoApproveSafeOCR', '', 'Auto-approvati: ' + autoApproved + '. Da controllare: ' + needsReview);
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

    const masterRow = Number(row[3]);
    const fileId = String(row[9] || '').trim();
    const newName = String(row[11] || '').trim();
    const targetPath = String(row[12] || '').trim();
    const action = String(row[13] || '').trim();

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
      planSheet.getRange(i + 1, 17).setValue(message);
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
      planSheet.getRange(i + 1, 15).setValue(url);
      planSheet.getRange(i + 1, 17).setValue('Applicato il ' + new Date().toISOString());
      if (masterSheet && masterRow > 1) {
        masterSheet.getRange(masterRow, 6).setValue('OK');
        masterSheet.getRange(masterRow, 7).setValue(newName);
        masterSheet.getRange(masterRow, 10).setValue(targetPath);
        masterSheet.getRange(masterRow, 11).setValue(url);
      }
      logDriveAutomation_('OK', 'apply', fileId, 'Rinominato/spostato: ' + newName);
      results.push({ row: i + 1, ok: true, url: url, dryRun: false });
    } else {
      const message = 'DRY-RUN OK: ' + file.getName() + ' -> ' + newName;
      planSheet.getRange(i + 1, 17).setValue(message);
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
    results: results.slice(0, 50)
  };
}

function scanFolder_(folder, path, rows) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    rows.push([
      file.getId(), name, file.getMimeType(), extensionFromName_(name), file.getSize(),
      formatDateTime_(file.getDateCreated()), formatDateTime_(file.getLastUpdated()), path, file.getUrl()
    ]);
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const child = folders.next();
    scanFolder_(child, path + '/' + child.getName(), rows);
  }
}

function extractTextFromDriveFile_(fileId) {
  const file = DriveApp.getFileById(fileId);
  const mime = file.getMimeType();
  const name = file.getName();
  if (mime === MimeType.PLAIN_TEXT || /\.txt$/i.test(name)) return file.getBlob().getDataAsString();

  const token = ScriptApp.getOAuthToken();
  const copyUrl = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '/copy?supportsAllDrives=true';
  const copyResponse = UrlFetchApp.fetch(copyUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ name: 'OCR_TEMP_' + name, mimeType: 'application/vnd.google-apps.document' }),
    muteHttpExceptions: true
  });

  if (copyResponse.getResponseCode() >= 300) {
    throw new Error('OCR copy fallita: ' + copyResponse.getContentText().slice(0, 200));
  }

  const doc = JSON.parse(copyResponse.getContentText());
  Utilities.sleep(1200);
  const exportUrl = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(doc.id) + '/export?mimeType=text/plain';
  const exportResponse = UrlFetchApp.fetch(exportUrl, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });

  let text = '';
  if (exportResponse.getResponseCode() < 300) text = exportResponse.getContentText();
  try { DriveApp.getFileById(doc.id).setTrashed(true); } catch (error) {}
  if (!text) throw new Error('OCR export vuoto o non leggibile');
  return text;
}

function extractDocumentFields_(text, fileName) {
  const source = String(text || '');
  const compact = source.replace(/\s+/g, ' ').trim();
  return {
    text: compact,
    date: extractDate_(compact) || extractDate_(fileName),
    supplier: extractSupplier_(source, fileName),
    total: extractTotal_(compact),
    documentNumber: extractDocumentNumber_(compact) || extractDocumentNumber_(fileName),
    confidence: compact.length > 80 ? 70 : (compact.length ? 35 : 0),
    note: compact.length ? 'OCR letto' : 'OCR vuoto'
  };
}

function findBestFileMatch_(rawFiles, master) {
  let best = null;
  let secondScore = 0;
  rawFiles.forEach(function(file) {
    const result = scoreRawFileToMaster_(file, master);
    if (!best || result.score > best.score) {
      secondScore = best ? best.score : 0;
      best = { file: file, score: result.score, reason: result.reason, safe: result.safe };
    } else if (result.score > secondScore) {
      secondScore = result.score;
    }
  });
  if (!best || best.score < 40) return null;
  best.safe = best.safe && (best.score - secondScore >= 12 || best.score >= 92);
  best.reason += '. Secondo score: ' + secondScore;
  return best;
}

function scoreRawFileToMaster_(file, master) {
  const haystack = normalizeKey_([file.name, file.text, file.extractedSupplier, file.extractedDocumentNumber].join(' '));
  const nameKey = normalizeKey_(file.name);
  let score = 0;
  const reasons = [];

  candidateNames_(master.mainFileName, master.altNames).forEach(function(candidate) {
    if (candidate && (nameKey === candidate || nameKey.indexOf(candidate) !== -1 || haystack.indexOf(candidate) !== -1)) {
      score += 45;
      reasons.push('nome file/documento');
    }
  });

  const docKey = normalizeKey_(master.documentName);
  if (docKey && haystack.indexOf(docKey) !== -1) {
    score += 30;
    reasons.push('numero/documento');
  }

  const supplierKey = normalizeKey_(master.supplier);
  if (supplierKey && haystack.indexOf(supplierKey) !== -1) {
    score += 22;
    reasons.push('fornitore');
  }

  const masterTotal = parseAmount_(master.totalRaw);
  if (masterTotal && amountClose_(file.extractedTotal, masterTotal)) {
    score += 30;
    reasons.push('totale');
  } else if (masterTotal && file.text && file.text.indexOf(formatAmountLoose_(masterTotal)) !== -1) {
    score += 18;
    reasons.push('totale testo');
  }

  if (master.date && file.extractedDate && normalizeDate_(master.date) === normalizeDate_(file.extractedDate)) {
    score += 12;
    reasons.push('data');
  }

  if (file.ocrStatus === 'OK') score += 5;
  if (score > 100) score = 100;
  return { score: score, safe: score >= 80, reason: reasons.length ? reasons.join(', ') : 'nessuna corrispondenza forte' };
}

function parseMasterRow_(row, rowNumber) {
  return {
    rowNumber: rowNumber,
    date: row[0],
    area: row[1],
    documentName: row[2],
    supplier: row[3],
    totalRaw: row[4],
    status: row[5],
    mainFileName: row[6],
    altNames: row[7],
    formats: row[8],
    expectedPath: row[9],
    url: row[10],
    note: row[11]
  };
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

function replaceSheetData_(sheet, rows) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.autoResizeColumns(1, Math.min(sheet.getMaxColumns(), 17));
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

function countDriveAutomationNeedsReview_() {
  const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
  const planSheet = ss.getSheetByName(DRIVE_AUTOMATION_CONFIG.PLAN_TAB);
  if (!planSheet || planSheet.getLastRow() < 2) return 0;
  const values = planSheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < values.length; i += 1) {
    const status = String(values[i][1] || '').trim();
    const action = String(values[i][13] || '').trim();
    if (status !== 'GIA_COLLEGATO' && status !== 'SPOSTATO_OK' && action !== 'NESSUNA') count += 1;
  }
  return count;
}

function buildExtractedSummary_(file) {
  return [
    file.extractedSupplier ? 'Fornitore: ' + file.extractedSupplier : '',
    file.extractedTotal ? 'Totale: ' + file.extractedTotal : '',
    file.extractedDate ? 'Data: ' + file.extractedDate : '',
    file.extractedDocumentNumber ? 'Doc: ' + file.extractedDocumentNumber : ''
  ].filter(Boolean).join(' · ');
}

function extractDate_(text) {
  const value = String(text || '');
  const match = value.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/);
  return match ? normalizeDate_(match[1]) : '';
}

function extractDocumentNumber_(text) {
  const value = String(text || '');
  const match = value.match(/(?:fattura|ricevuta|documento|bonifico|n\.?|nr\.?|numero)\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/\-_.]{1,20})/i);
  return match ? match[1] : '';
}

function extractSupplier_(text, fileName) {
  const lines = String(text || '').split(/\r?\n/).map(function(line) { return line.trim(); }).filter(Boolean).slice(0, 18);
  const blocked = /^(fattura|ricevuta|documento|bonifico|data|totale|imponibile|iva|partita|codice|pagina|spett\.?le|cliente|europa service)/i;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/\s+/g, ' ');
    if (line.length >= 3 && line.length <= 55 && !blocked.test(line) && /[a-zA-Z]/.test(line)) return line;
  }
  return String(fileName || '').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_-]+/g, ' ').trim();
}

function extractTotal_(text) {
  const value = String(text || '');
  const amounts = [];
  const regex = /(?:totale|importo|eur|€)?\s*([0-9]{1,3}(?:[\.\s][0-9]{3})*,[0-9]{2}|[0-9]+\.[0-9]{2})/gi;
  let match;
  while ((match = regex.exec(value)) !== null) {
    const amount = parseAmount_(match[1]);
    if (amount > 0 && amount < 1000000) amounts.push(amount);
  }
  if (!amounts.length) return '';
  return Math.max.apply(null, amounts);
}

function parseAmount_(value) {
  if (typeof value === 'number') return value;
  const raw = String(value || '').replace(/[^0-9,.-]/g, '').trim();
  if (!raw) return 0;
  if (raw.indexOf(',') !== -1) return Number(raw.replace(/\./g, '').replace(',', '.')) || 0;
  return Number(raw) || 0;
}

function amountClose_(a, b) {
  const x = Number(a || 0);
  const y = Number(b || 0);
  return x && y && Math.abs(x - y) <= 0.02;
}

function formatAmountLoose_(value) {
  return Number(value || 0).toFixed(2).replace('.', ',');
}

function normalizeDate_(value) {
  const text = String(value || '').trim();
  const iso = text.match(/^(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (iso) return iso[1] + '-' + pad2_(iso[2]) + '-' + pad2_(iso[3]);
  const eu = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (eu) {
    const year = eu[3].length === 2 ? '20' + eu[3] : eu[3];
    return year + '-' + pad2_(eu[2]) + '-' + pad2_(eu[1]);
  }
  return text.slice(0, 10);
}

function candidateNames_(mainName, alternatives) {
  const names = [];
  if (mainName) names.push(mainName);
  if (alternatives) String(alternatives).split(',').forEach(function(item) { if (item.trim()) names.push(item.trim()); });
  return names.map(normalizeKey_).filter(Boolean);
}

function buildSafeName_(date, supplier, documentName, total, area, extension) {
  const cleanDate = normalizeDate_(date) || 'DATA-DA-VERIFICARE';
  const base = [cleanDate, supplier, documentName, total, area]
    .filter(Boolean).join('_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 150);
  const safeExtension = extension ? String(extension).replace(/^\./, '') : 'pdf';
  return base + '.' + safeExtension;
}

function extensionFromName_(name) {
  const match = String(name || '').match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? match[1].toLowerCase() : '';
}

function normalizeKey_(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}

function truncate_(value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function formatDateTime_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function logDriveAutomation_(level, action, fileId, message) {
  try {
    const ss = SpreadsheetApp.openById(DRIVE_AUTOMATION_CONFIG.MASTER_SPREADSHEET_ID);
    const sheet = ensureSheet_(ss, DRIVE_AUTOMATION_CONFIG.LOG_TAB, ['Timestamp', 'Livello', 'Azione', 'File ID', 'Messaggio']);
    sheet.appendRow([new Date(), level, action, fileId, message]);
  } catch (error) {}
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
  return { total: rows.length, missing: missing.length, linked: linked.length, areas: areas.size }
}

export function buildPlanTsv(rows = []) {
  const headers = ['Esegui','Stato match','Score','Riga master','Data master','Area/tab','Documento master','Fornitore master','Totale master','File ID','Nome attuale','Nome nuovo','Percorso target','Azione','URL dopo spostamento','Dati estratti','Note']
  const body = rows.map((row) => ['FALSE','DA_MATCHARE','', '', row.date, row.area, row.documentLabel, row.supplier, formatItalianAmount(row.total), '', row.currentFileName, row.suggestedName, row.targetPath, row.action, '', '', 'Da completare automaticamente con OCR'])
  return [headers, ...body].map((row) => row.map(escapeTsvCell).join('\t')).join('\n')
}

export async function callDriveAutomationEndpoint(endpoint, action, payload = {}) {
  const cleanEndpoint = endpoint?.trim()
  if (!cleanEndpoint) return { ok: false, error: 'Endpoint Apps Script non configurato.' }
  const response = await fetch(cleanEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  })
  const text = await response.text()
  try {
    const json = text ? JSON.parse(text) : {}
    if (!response.ok || json.ok === false) return { ok: false, error: json.error ?? `Errore Apps Script ${response.status}`, raw: json }
    return json
  } catch {
    return { ok: false, error: text || `Risposta Apps Script non JSON (${response.status})` }
  }
}

function buildSafeFileName(parts, extension) {
  const base = parts.filter(Boolean).join('_').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 150)
  const ext = extension ? extension.replace(/^\./, '').toLowerCase() : 'pdf'
  return `${base || 'documento_da_verificare'}.${ext}`
}

function sanitizePathPart(value) {
  return String(value ?? 'Da_classificare').trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_') || 'Da_classificare'
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
  return new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))
}

function escapeTsvCell(value) {
  return String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim()
}
