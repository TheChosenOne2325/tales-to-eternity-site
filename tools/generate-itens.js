// tools/generate-itens.js
// Gera 1 JSON por item, separado por categoria, + atualiza data/compendium/itens.json

import fs from "fs";
import path from "path";

const BOOK = "Ecos Dos Cosmos";

const BASE_DATA = "data";
const OUT_BASE = path.join(BASE_DATA, "itens");       // data/itens/<categoria>/<id>.json
const COMP_DIR = path.join(BASE_DATA, "compendium");  // data/compendium/itens.json

const IN_DIR = path.join("tools", "items");           // tools/items/<categoria>.txt

const CATEGORIES = [
  "arma",
  "armadura",
  "escudo",
  "suprimento",
  "aventura",
  "conteiner",
  "pocao",
  "municao",
];

// ---------- helpers ----------
function readTextSmart(filePath) {
  const buf = fs.readFileSync(filePath);

  // Detecta UTF-16/arquivo com muitos bytes nulos
  const hasNulls = buf.includes(0x00);

  let txt = buf.toString(hasNulls ? "utf16le" : "utf8");

  // remove BOM (UTF-8/UTF-16)
  txt = txt.replace(/^\uFEFF/, "");

  return txt;
}

function parseLine(line) {
  // permite '|' na descrição (junta o resto)
  const parts = line.split("|").map(s => s.trim());
  if (parts.length < 3) return null;

  const id = parts[0];
  const name = parts[1];
  const desc = parts.slice(2).join("|").trim();

  if (!id || !name || !desc) return null;
  return { id, name, desc };
}

// ---------- start ----------
fs.mkdirSync(OUT_BASE, { recursive: true });
fs.mkdirSync(COMP_DIR, { recursive: true });

const compendium = {
  id: "itens",
  title: "Itens",
  columns: ["Nome", "Categoria", "Livro"],
  items: [],
};

let total = 0;
let totalSkipped = 0;

for (const category of CATEGORIES) {
  const filePath = path.join(IN_DIR, `${category}.txt`);

  if (!fs.existsSync(filePath)) {
    console.log(`(skip) Não achei: ${filePath}`);
    continue;
  }

  // garante pasta da categoria
  const outDir = path.join(OUT_BASE, category);
  fs.mkdirSync(outDir, { recursive: true });

  const raw = readTextSmart(filePath);

  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("#"));

  console.log(`\n== ${category}.txt == (${lines.length} linhas)`);

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      totalSkipped++;
      console.warn(`[IGNORADO] Linha inválida em ${category}.txt:`, line);
      continue;
    }

    const { id, name, desc } = parsed;

    const itemJson = {
      id,
      name,
      category,
      book: BOOK,
      img: `assets/imagens/itens/${category}/${id}.webp`,
      blocks: [{ type: "p", text: desc }],
    };

    const outPath = path.join(outDir, `${id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(itemJson, null, 2), "utf8");

    compendium.items.push({ id, name, category, book: BOOK });
    total++;
  }
}

// ordenar por nome
compendium.items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

fs.writeFileSync(
  path.join(COMP_DIR, "itens.json"),
  JSON.stringify(compendium, null, 2),
  "utf8"
);

console.log(`\n✔ Gerados ${total} itens`);
console.log(`✔ Ignorados ${totalSkipped} linhas (veja [IGNORADO] acima se houver)`);
console.log(`✔ Atualizado: ${path.join(COMP_DIR, "itens.json")}`);
