#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const CONFIG = {
  timeoutMs: 10000,
  concurrency: 6,
  userAgent:
    "Mozilla/5.0 (compatible; ReferenciotecaLinkChecker/1.0; +https://referencioteca.local)",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const failOnBroken = args.includes("--fail-on-broken");
const timeoutArg = readNumberArg(args, "--timeout");
const concurrencyArg = readNumberArg(args, "--concurrency");

if (Number.isFinite(timeoutArg) && timeoutArg > 0) CONFIG.timeoutMs = timeoutArg;
if (Number.isFinite(concurrencyArg) && concurrencyArg > 0) CONFIG.concurrency = concurrencyArg;

const SOURCES = [
  {
    file: "indexoteca.js",
    marker: "const studios =",
    sourceId: "indexoteca",
    getProject: (item) => item.name || "—",
    getAuthor: (item) => item.name || "—",
  },
  {
    file: "ref2d.js",
    marker: "const DB =",
    sourceId: "referencioteca",
    getProject: (item) => item.title || "—",
    getAuthor: (item) => item.author || "—",
  },
];

async function main() {
  const root = process.cwd();
  const collected = [];

  for (const source of SOURCES) {
    const filePath = path.join(root, source.file);
    const code = await fs.readFile(filePath, "utf8");
    const list = parseArrayFromSource(code, source.marker, source.file);

    list.forEach((item, index) => {
      const urls = normalizeUrls(item.url);
      if (urls.length === 0) return;

      urls.forEach((url) => {
        collected.push({
          source: source.sourceId,
          file: source.file,
          index,
          project: source.getProject(item),
          author: source.getAuthor(item),
          url,
        });
      });
    });
  }

  const grouped = new Map();
  collected.forEach((entry) => {
    if (!grouped.has(entry.url)) grouped.set(entry.url, []);
    grouped.get(entry.url).push(entry);
  });

  const uniqueUrls = [...grouped.keys()];
  const checks = dryRun
    ? uniqueUrls.map((url) => ({
        url,
        ok: false,
        category: "dry_run",
        statusCode: null,
        method: "none",
        finalUrl: url,
        error: "dry-run mode",
      }))
    : await checkUrls(uniqueUrls, CONFIG.concurrency);

  const checkByUrl = new Map(checks.map((item) => [item.url, item]));
  const rows = collected.map((entry) => ({ ...entry, ...checkByUrl.get(entry.url) }));

  const summary = buildSummary(rows);
  const generatedAt = new Date().toISOString();
  const reportDir = path.join(root, "reports", "link-health");
  await fs.mkdir(reportDir, { recursive: true });

  const stamp = generatedAt.replace(/[:.]/g, "-");
  const report = { generatedAt, dryRun, config: CONFIG, summary, rows };
  const jsonText = JSON.stringify(report, null, 2);
  const markdownText = buildMarkdownReport(report);
  const csvText = buildCsv(rows);
  const htmlText = buildStandaloneHtml(report);

  await Promise.all([
    fs.writeFile(path.join(reportDir, "latest.json"), jsonText, "utf8"),
    fs.writeFile(path.join(reportDir, "latest.md"), markdownText, "utf8"),
    fs.writeFile(path.join(reportDir, "latest.csv"), csvText, "utf8"),
    fs.writeFile(path.join(reportDir, "latest.html"), htmlText, "utf8"),
    fs.writeFile(path.join(reportDir, `link-health-${stamp}.json`), jsonText, "utf8"),
    fs.writeFile(path.join(reportDir, `link-health-${stamp}.md`), markdownText, "utf8"),
    fs.writeFile(path.join(reportDir, `link-health-${stamp}.csv`), csvText, "utf8"),
    fs.writeFile(path.join(reportDir, `link-health-${stamp}.html`), htmlText, "utf8"),
  ]);

  printSummary(summary, dryRun, reportDir);

  if (failOnBroken && summary.broken > 0) {
    process.exitCode = 2;
  }
}

function readNumberArg(argv, key) {
  const idx = argv.indexOf(key);
  if (idx === -1) return null;
  const next = Number(argv[idx + 1]);
  return Number.isFinite(next) ? next : null;
}

function parseArrayFromSource(sourceCode, marker, fileLabel) {
  const startMarker = sourceCode.indexOf(marker);
  if (startMarker === -1) {
    throw new Error(`No se encontró marcador "${marker}" en ${fileLabel}`);
  }

  const arrayStart = sourceCode.indexOf("[", startMarker);
  if (arrayStart === -1) {
    throw new Error(`No se encontró inicio de array después de "${marker}" en ${fileLabel}`);
  }

  const arrayLiteral = extractBracketLiteral(sourceCode, arrayStart, "[", "]");
  const wrapped = `(${arrayLiteral})`;
  const context = vm.createContext(Object.create(null));
  const arr = vm.runInContext(wrapped, context, { timeout: 2500 });
  if (!Array.isArray(arr)) {
    throw new Error(`El bloque extraído de ${fileLabel} no es un array`);
  }
  return arr;
}

function extractBracketLiteral(text, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === openChar) {
      depth += 1;
    } else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  throw new Error("No se pudo cerrar correctamente el literal de array");
}

function normalizeUrls(urlField) {
  if (!urlField) return [];
  const list = Array.isArray(urlField) ? urlField : [urlField];
  return list
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter((url) => url.startsWith("http://") || url.startsWith("https://"));
}

async function checkUrls(urls, concurrency) {
  const results = new Array(urls.length);
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const current = cursor;
      cursor += 1;
      const url = urls[current];
      try {
        results[current] = await checkSingleUrl(url);
      } catch (error) {
        results[current] = toErrorResult(url, error, "unknown");
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function checkSingleUrl(url) {
  const headers = { "user-agent": CONFIG.userAgent, "accept-language": "es-CL,es;q=0.9,en;q=0.8" };

  try {
    const head = await fetchWithTimeout(url, {
      method: "HEAD",
      headers,
      redirect: "follow",
    });

    if (shouldFallbackToGet(head.status)) {
      const getRes = await fetchWithTimeout(url, {
        method: "GET",
        headers: { ...headers, range: "bytes=0-0" },
        redirect: "follow",
      });
      return classifyResponse(url, getRes, "GET");
    }

    return classifyResponse(url, head, "HEAD");
  } catch (error) {
    return toErrorResult(url, error, classifyError(error));
  }
}

function shouldFallbackToGet(status) {
  return status === 400 || status === 403 || status === 405 || status === 429;
}

function classifyResponse(url, response, method) {
  const statusCode = response.status;
  const finalUrl = response.url || url;
  let category = "review";
  let ok = false;

  if (statusCode >= 200 && statusCode < 400) {
    category = "ok";
    ok = true;
  } else if (statusCode === 401 || statusCode === 403) {
    category = "restricted";
  } else if (statusCode === 404 || statusCode === 410 || statusCode === 451) {
    category = "broken";
  } else if (statusCode >= 500) {
    category = "server_error";
  } else if (statusCode === 429) {
    category = "rate_limited";
  }

  return {
    url,
    ok,
    category,
    statusCode,
    method,
    finalUrl,
    error: null,
  };
}

function classifyError(error) {
  if (!error) return "unknown";
  if (error.name === "AbortError") return "timeout";

  const message = `${error.message || ""}`.toLowerCase();
  const code = `${error.code || error.cause?.code || ""}`.toLowerCase();
  const combined = `${message} ${code}`;

  if (combined.includes("enotfound") || combined.includes("eai_again")) return "dns_error";
  if (combined.includes("econnrefused")) return "connection_refused";
  if (combined.includes("etimedout")) return "timeout";
  if (combined.includes("certificate") || combined.includes("tls")) return "tls_error";
  return "unknown";
}

function toErrorResult(url, error, category) {
  return {
    url,
    ok: false,
    category,
    statusCode: null,
    method: "error",
    finalUrl: url,
    error: error ? String(error.message || error) : "unknown error",
  };
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildSummary(rows) {
  const summary = {
    totalRows: rows.length,
    uniqueUrls: new Set(rows.map((row) => row.url)).size,
    ok: 0,
    broken: 0,
    review: 0,
    restricted: 0,
    serverError: 0,
    rateLimited: 0,
    timeout: 0,
    dns: 0,
    unknown: 0,
    critical: 0,
  };

  rows.forEach((row) => {
    if (row.category === "ok") summary.ok += 1;
    else if (row.category === "broken") summary.broken += 1;
    else if (row.category === "restricted") summary.restricted += 1;
    else if (row.category === "server_error") summary.serverError += 1;
    else if (row.category === "rate_limited") summary.rateLimited += 1;
    else if (row.category === "timeout") summary.timeout += 1;
    else if (row.category === "dns_error") summary.dns += 1;
    else if (row.category === "review" || row.category === "dry_run") summary.review += 1;
    else summary.unknown += 1;
  });

  summary.critical = summary.broken + summary.serverError + summary.dns;

  return summary;
}

function buildMarkdownReport(report) {
  const problematic = report.rows.filter((row) => row.category !== "ok");
  const critical = report.rows.filter(
    (row) => row.category === "broken" || row.category === "server_error" || row.category === "dns_error"
  );

  const lines = [];
  lines.push("# Link Health Report");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Modo: ${report.dryRun ? "dry-run" : "network check"}`);
  lines.push("");
  lines.push("## Resumen");
  lines.push("");
  lines.push(`- Registros revisados: ${report.summary.totalRows}`);
  lines.push(`- URLs únicas: ${report.summary.uniqueUrls}`);
  lines.push(`- OK: ${report.summary.ok}`);
  lines.push(`- Caídos (críticos): ${report.summary.critical}`);
  lines.push(`- Revisión manual: ${problematic.length - critical.length}`);
  lines.push("");

  lines.push("## Caídos (acción)");
  lines.push("");
  if (critical.length === 0) {
    lines.push("Sin links críticos en esta ejecución.");
  } else {
    lines.push("| Fuente | Proyecto | Autor | URL | Estado | Categoría |");
    lines.push("|---|---|---|---|---:|---|");
    critical.forEach((row) => {
      lines.push(
        `| ${escapePipe(row.source)} | ${escapePipe(row.project)} | ${escapePipe(row.author)} | ${escapePipe(
          row.url
        )} | ${row.statusCode ?? "—"} | ${row.category} |`
      );
    });
  }
  lines.push("");

  lines.push("## Revisión Manual");
  lines.push("");
  const manual = problematic.filter((row) => !critical.includes(row));
  if (manual.length === 0) {
    lines.push("No hay links pendientes de revisión manual.");
  } else {
    lines.push("| Fuente | Proyecto | Autor | URL | Estado | Categoría |");
    lines.push("|---|---|---|---|---:|---|");
    manual.forEach((row) => {
      lines.push(
        `| ${escapePipe(row.source)} | ${escapePipe(row.project)} | ${escapePipe(row.author)} | ${escapePipe(
          row.url
        )} | ${row.statusCode ?? "—"} | ${row.category} |`
      );
    });
  }
  lines.push("");
  lines.push("## Próximo Paso Operativo");
  lines.push("");
  lines.push("1. Revisar primero la sección `Caídos (acción)`.");
  lines.push("2. Contactar autores responsables de esos proyectos.");
  lines.push("3. Reemplazar URL o marcar el registro para seguimiento.");
  lines.push("4. Ejecutar nuevamente este checker para validar el cambio.");

  return `${lines.join("\n")}\n`;
}

function buildCsv(rows) {
  const header = ["source", "project", "author", "url", "statusCode", "category", "method", "finalUrl", "error"];
  const body = rows.map((row) =>
    [
      row.source,
      row.project,
      row.author,
      row.url,
      row.statusCode ?? "",
      row.category,
      row.method,
      row.finalUrl ?? "",
      row.error ?? "",
    ]
      .map(csvCell)
      .join(",")
  );
  return `${header.join(",")}\n${body.join("\n")}\n`;
}

function buildStandaloneHtml(report) {
  const reportJson = JSON.stringify(report).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Link Health — Referencioteca</title>
  <style>
    :root {
      --bg: #0e0e10;
      --panel: #141418;
      --line: #2a2a2e;
      --ink: #eaeaea;
      --dim: #a3a3a3;
      --danger: #ff6b6b;
      --warn: #ffd166;
      --ok: #3ddc97;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      line-height: 1.4;
    }
    .wrap { max-width: 1280px; margin: 0 auto; padding: 20px; }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    h1 { margin: 0; font-size: clamp(1.25rem, 3vw, 1.9rem); }
    .meta { color: var(--dim); font-size: 0.9rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 10px 12px;
    }
    .card .k { color: var(--dim); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .card .v { font-size: 1.1rem; font-weight: 700; margin-top: 3px; }
    .controls {
      display: grid;
      grid-template-columns: 1.4fr repeat(4, minmax(140px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .controls input,
    .controls select {
      width: 100%;
      min-height: 38px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--ink);
      padding: 0 12px;
      font-size: 0.9rem;
    }
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--dim);
      font-size: 0.86rem;
      margin-bottom: 10px;
      user-select: none;
    }
    .table-wrap {
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: auto;
      background: var(--panel);
    }
    table {
      border-collapse: collapse;
      width: 100%;
      min-width: 960px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px;
      text-align: left;
      vertical-align: top;
      font-size: 0.88rem;
    }
    th {
      position: sticky;
      top: 0;
      background: #121217;
      color: var(--dim);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      z-index: 1;
    }
    tr:last-child td { border-bottom: none; }
    a { color: var(--ink); text-underline-offset: 2px; }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid var(--line);
      font-size: 0.72rem;
      white-space: nowrap;
    }
    .chip.ok { color: var(--ok); border-color: color-mix(in oklab, var(--ok), var(--line)); }
    .chip.danger { color: var(--danger); border-color: color-mix(in oklab, var(--danger), var(--line)); }
    .chip.warn { color: var(--warn); border-color: color-mix(in oklab, var(--warn), var(--line)); }
    .empty {
      padding: 16px;
      color: var(--dim);
      text-align: center;
    }
    @media (max-width: 900px) {
      .wrap { padding: 14px; }
      .controls { grid-template-columns: 1fr 1fr; }
      table { min-width: 820px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <h1>Link Health Report</h1>
      <div class="meta">
        Generado: <span id="generatedAt"></span>
      </div>
    </div>

    <section class="summary" id="summary"></section>

    <section class="controls">
      <input id="q" type="search" placeholder="Buscar por proyecto, autor o URL..." />
      <select id="source"></select>
      <select id="category"></select>
      <select id="sortBy">
        <option value="severity">Orden: Severidad</option>
        <option value="project">Orden: Proyecto</option>
        <option value="author">Orden: Autor</option>
        <option value="status">Orden: Estado HTTP</option>
        <option value="source">Orden: Fuente</option>
      </select>
      <select id="direction">
        <option value="asc">Ascendente</option>
        <option value="desc">Descendente</option>
      </select>
    </section>

    <label class="toggle">
      <input id="includeOk" type="checkbox" />
      Incluir links OK
    </label>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fuente</th>
            <th>Proyecto</th>
            <th>Autor</th>
            <th>URL</th>
            <th>Estado</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
      <div id="empty" class="empty" hidden>Sin resultados para el filtro actual.</div>
    </div>
  </div>

  <script id="report-data" type="application/json">${reportJson}</script>
  <script>
    (() => {
      const report = JSON.parse(document.getElementById("report-data").textContent);
      const rows = report.rows || [];
      const severityRank = {
        broken: 1,
        dns_error: 2,
        server_error: 3,
        timeout: 4,
        rate_limited: 5,
        restricted: 6,
        review: 7,
        dry_run: 8,
        ok: 9,
      };

      const refs = {
        generatedAt: document.getElementById("generatedAt"),
        summary: document.getElementById("summary"),
        q: document.getElementById("q"),
        source: document.getElementById("source"),
        category: document.getElementById("category"),
        sortBy: document.getElementById("sortBy"),
        direction: document.getElementById("direction"),
        includeOk: document.getElementById("includeOk"),
        tbody: document.getElementById("rows"),
        empty: document.getElementById("empty"),
      };

      const state = {
        q: "",
        source: "all",
        category: "critical",
        sortBy: "severity",
        direction: "asc",
        includeOk: false,
      };

      refs.generatedAt.textContent = new Date(report.generatedAt).toLocaleString("es-CL");
      refs.includeOk.checked = false;

      const sources = Array.from(new Set(rows.map((r) => r.source))).sort((a, b) => a.localeCompare(b, "es"));
      refs.source.innerHTML = [
        '<option value="all">Fuente: todas</option>',
        ...sources.map((s) => '<option value="' + escapeHtml(s) + '">Fuente: ' + escapeHtml(s) + '</option>'),
      ].join("");

      refs.category.innerHTML = [
        '<option value="critical">Categoría: críticos</option>',
        '<option value="all">Categoría: todas</option>',
        '<option value="broken">broken (404/410)</option>',
        '<option value="dns_error">dns_error</option>',
        '<option value="server_error">server_error</option>',
        '<option value="timeout">timeout</option>',
        '<option value="restricted">restricted</option>',
        '<option value="ok">ok</option>',
      ].join("");

      refs.q.addEventListener("input", () => {
        state.q = refs.q.value.trim().toLowerCase();
        render();
      });
      refs.source.addEventListener("change", () => {
        state.source = refs.source.value;
        render();
      });
      refs.category.addEventListener("change", () => {
        state.category = refs.category.value;
        render();
      });
      refs.sortBy.addEventListener("change", () => {
        state.sortBy = refs.sortBy.value;
        render();
      });
      refs.direction.addEventListener("change", () => {
        state.direction = refs.direction.value;
        render();
      });
      refs.includeOk.addEventListener("change", () => {
        state.includeOk = refs.includeOk.checked;
        render();
      });

      function isCritical(row) {
        return row.category === "broken" || row.category === "dns_error" || row.category === "server_error";
      }

      function matchesCategory(row) {
        if (state.category === "all") return true;
        if (state.category === "critical") return isCritical(row);
        return row.category === state.category;
      }

      function matchesSource(row) {
        return state.source === "all" || row.source === state.source;
      }

      function matchesSearch(row) {
        if (!state.q) return true;
        const hay = [row.project, row.author, row.url, row.source, row.category].join(" ").toLowerCase();
        return hay.includes(state.q);
      }

      function shouldIncludeOk(row) {
        return state.includeOk || row.category !== "ok";
      }

      function compare(a, b) {
        let out = 0;
        if (state.sortBy === "severity") {
          out = (severityRank[a.category] || 99) - (severityRank[b.category] || 99);
        } else if (state.sortBy === "status") {
          out = (a.statusCode || 9999) - (b.statusCode || 9999);
        } else if (state.sortBy === "source") {
          out = (a.source || "").localeCompare(b.source || "", "es");
        } else if (state.sortBy === "author") {
          out = (a.author || "").localeCompare(b.author || "", "es");
        } else {
          out = (a.project || "").localeCompare(b.project || "", "es");
        }
        if (out === 0) out = (a.project || "").localeCompare(b.project || "", "es");
        return state.direction === "desc" ? -out : out;
      }

      function renderSummary(filtered) {
        const stats = {
          total: filtered.length,
          critical: filtered.filter(isCritical).length,
          broken: filtered.filter((r) => r.category === "broken").length,
          dns: filtered.filter((r) => r.category === "dns_error").length,
          ok: filtered.filter((r) => r.category === "ok").length,
        };

        refs.summary.innerHTML = [
          card("Filtrados", stats.total),
          card("Críticos", stats.critical),
          card("Broken", stats.broken),
          card("DNS", stats.dns),
          card("OK", stats.ok),
        ].join("");
      }

      function card(k, v) {
        return '<article class="card"><div class="k">' + escapeHtml(k) + '</div><div class="v">' + v + '</div></article>';
      }

      function renderRows(filtered) {
        if (filtered.length === 0) {
          refs.tbody.innerHTML = "";
          refs.empty.hidden = false;
          return;
        }
        refs.empty.hidden = true;
        refs.tbody.innerHTML = filtered
          .map((row) => {
            const chipClass = row.category === "ok" ? "ok" : isCritical(row) ? "danger" : "warn";
            const statusText = row.statusCode || "—";
            return [
              "<tr>",
              "<td>" + escapeHtml(row.source) + "</td>",
              "<td>" + escapeHtml(row.project) + "</td>",
              "<td>" + escapeHtml(row.author) + "</td>",
              '<td><a href="' + escapeAttr(row.url) + '" target="_blank" rel="noopener">' + escapeHtml(row.url) + "</a></td>",
              "<td>" + escapeHtml(String(statusText)) + "</td>",
              '<td><span class="chip ' + chipClass + '">' + escapeHtml(row.category) + "</span></td>",
              "</tr>",
            ].join("");
          })
          .join("");
      }

      function render() {
        const filtered = rows
          .filter(matchesSource)
          .filter(matchesCategory)
          .filter(shouldIncludeOk)
          .filter(matchesSearch)
          .sort(compare);

        renderSummary(filtered);
        renderRows(filtered);
      }

      function escapeHtml(text) {
        return String(text ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }
      function escapeAttr(text) {
        return escapeHtml(text).replace(/'/g, "&#39;");
      }

      render();
    })();
  </script>
</body>
</html>
`;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapePipe(text) {
  return String(text ?? "").replace(/\|/g, "\\|");
}

function printSummary(summary, dry, reportDir) {
  const mode = dry ? "DRY-RUN" : "CHECK";
  console.log(`[${mode}] Reporte generado en: ${reportDir}`);
  console.log(`- Total registros: ${summary.totalRows}`);
  console.log(`- URLs únicas: ${summary.uniqueUrls}`);
  console.log(`- OK: ${summary.ok}`);
  console.log(`- Broken (404/410): ${summary.broken}`);
  console.log(`- Restricted: ${summary.restricted}`);
  console.log(`- Server error: ${summary.serverError}`);
  console.log(`- Rate limited: ${summary.rateLimited}`);
  console.log(`- Timeout: ${summary.timeout}`);
  console.log(`- DNS: ${summary.dns}`);
  console.log(`- Critical total: ${summary.critical}`);
  console.log(`- Review/other: ${summary.review + summary.unknown}`);
}

main().catch((error) => {
  console.error("[link-checker] Error:", error.message || error);
  process.exitCode = 1;
});
