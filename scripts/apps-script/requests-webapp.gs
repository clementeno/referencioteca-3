/**
 * Referencioteca Requests Web App (Google Apps Script)
 *
 * 1) Crea una hoja Google Sheets con nombre: Requests
 * 2) Extensiones -> Apps Script -> pega este archivo
 * 3) Configura SHEET_ID y API_KEY
 * 4) Deploy -> New deployment -> Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5) Copia la URL /exec y pégala en:
 *    - ref2d.js -> REQUESTS_API_URL
 *    - reports/requests-monitor.html -> REQUESTS_API_URL
 */

const SHEET_ID = '1BXLnAftgrP1cGIpKEtBoinokC5rT8Zd6c9X8NRkCCKE';
const SHEET_NAME = 'Requests';
const API_KEY = 'ref123.teca';
const BUNDLE_BCC = 'referencioteca.cl@gmail.com';

const HEADERS = [
  'id',
  'createdAt',
  'type',
  'typeLabel',
  'projectTitle',
  'projectAuthor',
  'projectYear',
  'projectArea',
  'projectUrl',
  'requesterEmail',
  'message',
  'status',
  'updatedAt'
];

function doGet(e) {
  const mode = String((e && e.parameter && e.parameter.mode) || 'list');
  const apiKey = String((e && e.parameter && e.parameter.apiKey) || '');
  if (apiKey !== API_KEY) return jsonOut({ ok: false, error: 'unauthorized' });

  if (mode === 'jsonp') {
    const callback = String((e && e.parameter && e.parameter.callback) || 'callback');
    const data = listItems();
    return jsOut(`${safeCallback(callback)}(${JSON.stringify({ ok: true, items: data })});`);
  }

  if (mode === 'list') {
    return jsonOut({ ok: true, items: listItems() });
  }

  return jsonOut({ ok: false, error: 'invalid_mode' });
}

function doPost(e) {
  const params = postParams(e);
  const mode = String(params.mode || 'create');
  const apiKey = String(params.apiKey || '');
  if (apiKey !== API_KEY) return jsonOut({ ok: false, error: 'unauthorized' });

  if (mode === 'create') {
    upsertItem(params);
    return jsonOut({ ok: true });
  }

  if (mode === 'update') {
    const id = String(params.id || '');
    const status = String(params.status || 'open');
    if (!id) return jsonOut({ ok: false, error: 'missing_id' });
    return jsonOut({ ok: updateStatus(id, status) });
  }

  if (mode === 'delete') {
    const id = String(params.id || '');
    if (!id) return jsonOut({ ok: false, error: 'missing_id' });
    return jsonOut({ ok: deleteById(id) });
  }

  if (mode === 'clear') {
    clearSheetData();
    return jsonOut({ ok: true });
  }

  if (mode === 'send_bundle') {
    return jsonOut(sendBundleEmail(params));
  }

  return jsonOut({ ok: false, error: 'invalid_mode' });
}

function sheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  ensureHeader(sh);
  return sh;
}

function ensureHeader(sh) {
  const first = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const isEmpty = first.every((v) => !String(v || '').trim());
  if (isEmpty) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }
  const same = HEADERS.every((h, i) => String(first[i] || '') === h);
  if (!same) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function listItems() {
  const sh = sheet();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const values = sh.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const out = values
    .map((row) => rowToObj(row))
    .filter((x) => x.id)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return out;
}

function upsertItem(params) {
  const sh = sheet();
  const id = String(params.id || `rq_${Date.now()}`);
  const now = new Date().toISOString();

  const rowObj = {
    id,
    createdAt: String(params.createdAt || now),
    type: String(params.type || ''),
    typeLabel: String(params.typeLabel || ''),
    projectTitle: String(params.projectTitle || ''),
    projectAuthor: String(params.projectAuthor || ''),
    projectYear: String(params.projectYear || ''),
    projectArea: String(params.projectArea || ''),
    projectUrl: String(params.projectUrl || ''),
    requesterEmail: String(params.requesterEmail || ''),
    message: String(params.message || ''),
    status: String(params.status || 'open'),
    updatedAt: now
  };

  const found = findRowById(sh, id);
  if (found > 0) {
    sh.getRange(found, 1, 1, HEADERS.length).setValues([objToRow(rowObj)]);
    return;
  }
  sh.appendRow(objToRow(rowObj));
}

function updateStatus(id, status) {
  const sh = sheet();
  const row = findRowById(sh, id);
  if (row < 2) return false;

  const values = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const obj = rowToObj(values);
  obj.status = status;
  obj.updatedAt = new Date().toISOString();
  sh.getRange(row, 1, 1, HEADERS.length).setValues([objToRow(obj)]);
  return true;
}

function deleteById(id) {
  const sh = sheet();
  const row = findRowById(sh, id);
  if (row < 2) return false;
  sh.deleteRow(row);
  return true;
}

function clearSheetData() {
  const sh = sheet();
  const lastRow = sh.getLastRow();
  if (lastRow > 1) {
    sh.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
  }
}

function findRowById(sh, id) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sh.getRange(2, 1, lastRow - 1, 1).getValues().map((r) => String(r[0] || ''));
  const idx = ids.indexOf(String(id || ''));
  return idx === -1 ? -1 : idx + 2;
}

function rowToObj(row) {
  const obj = {};
  HEADERS.forEach((k, i) => {
    obj[k] = row[i] == null ? '' : String(row[i]);
  });
  return obj;
}

function objToRow(obj) {
  return HEADERS.map((k) => String(obj[k] || ''));
}

function postParams(e) {
  if (!e) return {};
  if (e.parameter && Object.keys(e.parameter).length) return e.parameter;
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      return {};
    }
  }
  return {};
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsOut(text) {
  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function safeCallback(name) {
  return String(name || 'callback').replace(/[^a-zA-Z0-9_$.]/g, '');
}

function sendBundleEmail(params) {
  const recipient = String(params.recipientEmail || '').trim();
  const collectionName = String(params.collectionName || 'Selección Referencioteca').trim();
  const pdfBase64 = String(params.pdfBase64 || '').trim();
  const pdfFileName = String(params.pdfFileName || 'seleccion-referencioteca.pdf').trim();
  const projectsRaw = params.projects;

  if (!recipient) return { ok: false, error: 'missing_recipient' };
  if (!pdfBase64) return { ok: false, error: 'missing_pdf' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipient)) return { ok: false, error: 'invalid_recipient' };

  let projects = [];
  try {
    if (Array.isArray(projectsRaw)) projects = projectsRaw;
    else if (typeof projectsRaw === 'string' && projectsRaw.trim()) projects = JSON.parse(projectsRaw);
  } catch (_err) {
    projects = [];
  }

  const summaryLines = projects.slice(0, 25).map((item, idx) => {
    const title = String((item && item.title) || 'Proyecto sin título');
    const author = String((item && item.author) || '—');
    return `${idx + 1}. ${title} — ${author}`;
  });
  const summary = summaryLines.length ? summaryLines.join('\n') : 'Sin detalle de proyectos.';

  try {
    const pdfBytes = Utilities.base64Decode(pdfBase64);
    const attachment = Utilities.newBlob(pdfBytes, 'application/pdf', pdfFileName);
    const subject = `[Referencioteca] ${collectionName}`;
    const htmlBody =
      `<p>Hola,</p>` +
      `<p>Adjuntamos tu selección de proyectos de Referencioteca.</p>` +
      `<p><strong>Nombre de selección:</strong> ${escapeHtml(collectionName)}</p>` +
      `<p><strong>Total de proyectos:</strong> ${projects.length || 0}</p>` +
      `<p>Saludos,<br/>Referencioteca</p>`;
    const textBody =
      `Hola,\n\n` +
      `Adjuntamos tu selección de proyectos de Referencioteca.\n\n` +
      `Nombre de selección: ${collectionName}\n` +
      `Total de proyectos: ${projects.length || 0}\n\n` +
      `Detalle:\n${summary}\n\n` +
      `Saludos,\nReferencioteca`;

    MailApp.sendEmail({
      to: recipient,
      bcc: BUNDLE_BCC,
      subject: subject,
      body: textBody,
      htmlBody: htmlBody,
      attachments: [attachment],
      name: 'Referencioteca'
    });

    return {
      ok: true,
      remainingDailyQuota: MailApp.getRemainingDailyQuota()
    };
  } catch (err) {
    return { ok: false, error: 'send_failed', message: String(err) };
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
