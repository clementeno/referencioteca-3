#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REF2D_PATH = path.join(ROOT, "ref2d.js");
const OUT_JSON = path.join(ROOT, "reports", "clickable-entities.by-project.json");
const OUT_CSV = path.join(ROOT, "reports", "clickable-entities.by-project.csv");

function norm(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9@._\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNameKey(value) {
  return norm(value).replace(/\s+/g, " ").trim();
}

function cleanAuthorName(raw) {
  return String(raw || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalPersonLabel(raw) {
  const value = String(raw || "").replace(/\s+/g, " ").trim();
  if (!value) return "";
  if (value.startsWith("@")) return value.replace(/[^@A-Za-z0-9._-]+/g, "");
  return cleanAuthorName(value).replace(/^(?:por|by)\s+/i, "").replace(/[.,;:]+$/g, "").trim();
}

function isLikelyPersonCandidate(raw) {
  const value = canonicalPersonLabel(raw);
  if (!value) return false;
  if (value.startsWith("@")) return value.length >= 3;
  if (/\d/.test(value)) return false;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 6) return false;
  return words.every((w) => /^[A-ZÁÉÍÓÚÜÑ][\p{L}'’.\-]*$/u.test(w));
}

function isLikelyStudioCandidate(raw) {
  const value = String(raw || "").replace(/\s+/g, " ").replace(/[.,;:]+$/g, "").trim();
  if (!value) return false;
  if (!/\b(estudio|studio)\b/i.test(value)) return false;
  if (/https?:\/\//i.test(value)) return false;
  const words = value.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 7;
}

function extractPersonCandidates(rawText) {
  const text = String(rawText || "")
    .replace(/\.\s+(?=[A-ZÁÉÍÓÚÜÑ@])/g, "\n")
    .replace(/;\s+(?=[A-ZÁÉÍÓÚÜÑ@])/g, "\n");
  if (!text.trim()) return [];
  const matches = text.match(/@[A-Za-z0-9._-]{2,}|[A-ZÁÉÍÓÚÜÑ][\p{L}'’-]+(?:\s+(?:de|del|la|las|los|y|da|do|dos|van|von|di)\s+[A-ZÁÉÍÓÚÜÑ][\p{L}'’-]+|\s+[A-ZÁÉÍÓÚÜÑ][\p{L}'’-]+){0,3}/gu) || [];
  const out = [];
  const seen = new Set();
  matches.forEach((match) => {
    const parts = String(match).split(/\s+(?:y|and|&)\s+/i).map((p) => p.trim()).filter(Boolean);
    parts.forEach((part) => {
      const label = canonicalPersonLabel(part);
      const key = toNameKey(label);
      if (!label || !key || seen.has(key)) return;
      if (!isLikelyPersonCandidate(label)) return;
      seen.add(key);
      out.push(label);
    });
  });
  return out;
}

function extractStudioCandidates(rawText) {
  const text = String(rawText || "");
  if (!text.trim()) return [];
  const out = [];
  const seen = new Set();
  const patterns = [
    /\b(?:Estudio|Studio)\s+[A-ZÁÉÍÓÚÜÑ0-9@][\p{L}0-9@&.'’_-]*(?:\s+[A-ZÁÉÍÓÚÜÑ0-9@][\p{L}0-9@&.'’_-]*){0,4}/gu,
    /\b[A-ZÁÉÍÓÚÜÑ0-9@][\p{L}0-9@&.'’_-]*(?:\s+[A-ZÁÉÍÓÚÜÑ0-9@][\p{L}0-9@&.'’_-]*){0,4}\s+(?:Estudio|Studio)\b/gu
  ];
  patterns.forEach((pattern) => {
    (text.match(pattern) || []).forEach((m) => {
      const label = String(m || "").replace(/\s+/g, " ").replace(/[.,;:]+$/g, "").trim();
      const key = toNameKey(label);
      if (!label || !key || seen.has(key)) return;
      if (!isLikelyStudioCandidate(label)) return;
      seen.add(key);
      out.push(label);
    });
  });
  return out;
}

function splitAuthorNames(author) {
  return String(author || "")
    .split(/\s*[,;/]\s*|\s+\+\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractDbSource(fileText) {
  const startNeedle = "const DB = [";
  const endNeedle = "  ];\n    // Normalizar tags + crear índice de búsqueda";
  const start = fileText.indexOf(startNeedle);
  const end = fileText.indexOf(endNeedle);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No se pudo ubicar el bloque DB en ref2d.js");
  }
  return `[${fileText.slice(start + startNeedle.length, end)}]`;
}

const source = fs.readFileSync(REF2D_PATH, "utf8");
const DB = Function(`"use strict"; return (${extractDbSource(source)});`)();

const rows = [];

DB.forEach((project, idx) => {
  const projectTitle = String(project?.title || "").trim() || `Proyecto #${idx + 1}`;
  const projectAuthor = cleanAuthorName(project?.author || "");
  const collab = String(project?.collab || "");
  const entities = [];
  const seen = new Set();

  splitAuthorNames(projectAuthor).forEach((name) => {
    const label = canonicalPersonLabel(name);
    const key = toNameKey(label);
    if (!label || !key || seen.has(`persona:${key}`)) return;
    seen.add(`persona:${key}`);
    entities.push({ type: "persona", label });
  });

  extractPersonCandidates(collab).forEach((name) => {
    const key = toNameKey(name);
    if (!key || seen.has(`persona:${key}`)) return;
    seen.add(`persona:${key}`);
    entities.push({ type: "persona", label: name });
  });

  extractStudioCandidates(collab).forEach((name) => {
    const key = toNameKey(name);
    if (!key || seen.has(`estudio:${key}`)) return;
    seen.add(`estudio:${key}`);
    entities.push({ type: "estudio", label: name });
  });

  entities.forEach((entity) => {
    rows.push({
      project_index: idx + 1,
      project_title: projectTitle,
      project_author: projectAuthor,
      entity_type: entity.type,
      clickable_entity: entity.label
    });
  });
});

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(
  OUT_JSON,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "ref2d.js",
      totalRows: rows.length,
      rows
    },
    null,
    2
  ) + "\n",
  "utf8"
);

const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const csv = [
  "project_index,project_title,project_author,entity_type,clickable_entity",
  ...rows.map((r) =>
    [
      r.project_index,
      esc(r.project_title),
      esc(r.project_author),
      r.entity_type,
      esc(r.clickable_entity)
    ].join(",")
  )
].join("\n") + "\n";
fs.writeFileSync(OUT_CSV, csv, "utf8");

console.log(`JSON: ${OUT_JSON}`);
console.log(`CSV:  ${OUT_CSV}`);
console.log(`Rows: ${rows.length}`);
