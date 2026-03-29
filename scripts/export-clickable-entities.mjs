#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REF2D_PATH = path.join(ROOT, "ref2d.js");
const OUTPUT_PATH = path.join(ROOT, "reports", "clickable-entities.generated.json");

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
      const label = String(m || "").replace(/\s+/g, " ").trim();
      const clean = label.replace(/[.,;:]+$/g, "").trim();
      const key = toNameKey(clean);
      if (!clean || !key || seen.has(key)) return;
      if (!isLikelyStudioCandidate(clean)) return;
      seen.add(key);
      out.push(clean);
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
  const raw = fileText.slice(start + startNeedle.length, end);
  return `[${raw}]`;
}

const source = fs.readFileSync(REF2D_PATH, "utf8");
const dbSource = extractDbSource(source);
const DB = Function(`"use strict"; return (${dbSource});`)();

const peopleMap = new Map();
const studioMap = new Map();

for (const project of DB) {
  const authorParts = splitAuthorNames(project?.author || "");
  authorParts.forEach((name) => {
    const label = canonicalPersonLabel(name);
    const key = toNameKey(label);
    if (!label || !key) return;
    peopleMap.set(key, label);
  });

  const collab = String(project?.collab || "");
  extractPersonCandidates(collab).forEach((name) => {
    const key = toNameKey(name);
    if (!key) return;
    if (!peopleMap.has(key)) peopleMap.set(key, name);
  });
  extractStudioCandidates(collab).forEach((name) => {
    const key = toNameKey(name);
    if (!key) return;
    studioMap.set(key, name);
  });
}

const result = {
  generatedAt: new Date().toISOString(),
  source: "ref2d.js",
  note: "Edita clickable-entities-overrides.js para bloquear, mapear o incluir entidades.",
  clickablePeople: Array.from(peopleMap.values()).sort((a, b) => a.localeCompare(b, "es")),
  clickableStudios: Array.from(studioMap.values()).sort((a, b) => a.localeCompare(b, "es"))
};

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf8");

console.log(`Export listo: ${OUTPUT_PATH}`);
console.log(`People: ${result.clickablePeople.length} | Studios: ${result.clickableStudios.length}`);
