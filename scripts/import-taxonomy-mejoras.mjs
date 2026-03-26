#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const REF_FILE = path.join(ROOT, "ref2d.js");
const INPUT_CSV = process.argv[2] || "/Users/clemente/Downloads/mejoras.csv";
const OUTPUT_JS = path.join(ROOT, "taxonomy-enhancements.js");
const OUTPUT_SAFE = path.join(ROOT, "reports", `taxonomy-safe-pre-mejoras-${new Date().toISOString().slice(0, 10)}.json`);

function norm(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function splitPipeValues(value) {
  return String(value || "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
}

function readRef2dConstArray(source, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[(.*?)\\];`, "s");
  const m = source.match(re);
  if (!m) throw new Error(`No se pudo extraer ${name} desde ref2d.js`);
  return Function(`"use strict"; return [${m[1]}];`)();
}

function readRef2dConstObject(source, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\{(.*?)\\};`, "s");
  const m = source.match(re);
  if (!m) throw new Error(`No se pudo extraer ${name} desde ref2d.js`);
  return Function(`"use strict"; return ({${m[1]}});`)();
}

function readCsvMacRoman(file) {
  return execFileSync("iconv", ["-f", "MACROMAN", "-t", "UTF-8", file], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
}

function parseSemicolonCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const rows = [];
  for (const line of lines) {
    rows.push(line.split(";").map((v) => v.trim()));
  }
  return rows;
}

function canonicalTagKeyFactory(tagAliases) {
  return (tag) => {
    const k = norm(tag);
    return norm(tagAliases[k] || k);
  };
}

function makePrincipalOverrideKey(value) {
  const k = norm(value);
  const OVERRIDES = {
    "diseno industrial": "industrial",
    "diseño industrial": "industrial",
    "diseño de servicio": "diseno servicio",
    "diseno de servicio": "diseno servicio",
    "diseno de servicios": "diseno servicio",
    "diseño de servicios": "diseno servicio",
    "direccion de arte": "direccion de arte",
    "dirección de arte": "direccion de arte"
  };
  return OVERRIDES[k] || "";
}

function jsString(value) {
  return JSON.stringify(value);
}

const refSource = fs.readFileSync(REF_FILE, "utf8");
const TAGS = readRef2dConstArray(refSource, "TAGS");
const SUGGESTIONS = readRef2dConstArray(refSource, "SUGGESTIONS");
const TAG_ALIASES = readRef2dConstObject(refSource, "TAG_ALIASES");
const canonicalTagKey = canonicalTagKeyFactory(TAG_ALIASES);

fs.mkdirSync(path.dirname(OUTPUT_SAFE), { recursive: true });
fs.writeFileSync(
  OUTPUT_SAFE,
  JSON.stringify(
    {
      savedAt: new Date().toISOString(),
      source: "ref2d.js",
      TAGS,
      SUGGESTIONS,
      TAG_ALIASES
    },
    null,
    2
  ) + "\n",
  "utf8"
);

const csvText = readCsvMacRoman(INPUT_CSV);
const rows = parseSemicolonCsv(csvText);
if (rows.length <= 1) throw new Error("CSV sin filas útiles.");

const header = rows[0];
const dataRows = rows.slice(1);

const colIndex = {
  principal: 0,
  subcategorias: 1,
  keywords: 2,
  sinonimos: 3,
  colaLarga: 4
};

if (header.length < 5) {
  throw new Error("CSV inesperado: faltan columnas.");
}

const aliases = {};
const suggestions = new Set();
const projectTags = new Set();

for (const row of dataRows) {
  const principal = row[colIndex.principal] || "";
  const subcategorias = row[colIndex.subcategorias] || "";
  const keywords = row[colIndex.keywords] || "";
  const sinonimos = row[colIndex.sinonimos] || "";
  const colaLarga = row[colIndex.colaLarga] || "";
  if (!principal.trim()) continue;

  const override = makePrincipalOverrideKey(principal);
  const principalKey = override || canonicalTagKey(principal);
  if (!principalKey) continue;

  projectTags.add(principal.trim());
  suggestions.add(principal.trim());

  const principalNorm = norm(principal);
  aliases[principalNorm] = principalKey;

  const allTerms = [
    ...splitPipeValues(subcategorias),
    ...splitPipeValues(keywords),
    ...splitPipeValues(sinonimos),
    ...splitPipeValues(colaLarga)
  ];

  for (const termRaw of allTerms) {
    const term = termRaw.trim();
    if (!term) continue;
    const key = norm(term);
    if (!key) continue;
    aliases[key] = principalKey;
    suggestions.add(term);
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  sourceCsv: INPUT_CSV,
  version: "mejoras-2026-03-25",
  projectTags: Array.from(projectTags).sort((a, b) => a.localeCompare(b, "es")),
  suggestions: Array.from(suggestions).sort((a, b) => a.localeCompare(b, "es")),
  aliases
};

const js = [
  "/* Auto-generated from mejoras.csv (MacRoman). Do not edit manually. */",
  "window.REF2D_TAXONOMY_ENHANCEMENTS = " + JSON.stringify(payload, null, 2) + ";",
  ""
].join("\n");

fs.writeFileSync(OUTPUT_JS, js, "utf8");

console.log(`SAFE backup: ${OUTPUT_SAFE}`);
console.log(`Enhancements: ${OUTPUT_JS}`);
console.log(`Aliases: ${Object.keys(payload.aliases).length}`);
console.log(`Suggestions: ${payload.suggestions.length}`);
