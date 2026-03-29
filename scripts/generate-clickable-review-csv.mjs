#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "reports", "clickable-entities.by-project.csv");
const OUTPUT = path.join(ROOT, "reports", "clickable-entities.review.csv");

if (!fs.existsSync(SOURCE)) {
  throw new Error(`No existe ${SOURCE}. Ejecuta primero: node scripts/export-clickable-entities-by-project.mjs`);
}

const raw = fs.readFileSync(SOURCE, "utf8").trim();
const lines = raw.split(/\r?\n/);
const header = lines.shift();
if (!header) throw new Error("CSV fuente vacío");

const outHeader = [
  "project_index",
  "project_title",
  "project_author",
  "entity_type",
  "clickable_entity",
  "accion",
  "nuevo_nombre",
  "nota"
].join(",");

const rows = [outHeader];
for (const line of lines) {
  if (!line.trim()) continue;
  rows.push(`${line},,,`);
}

fs.writeFileSync(OUTPUT, rows.join("\n") + "\n", "utf8");
console.log(`CSV editable generado: ${OUTPUT}`);
console.log(`Filas: ${rows.length - 1}`);
