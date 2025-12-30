import fs from "fs";
import path from "path";

const ITENS_DIR = path.join("data", "itens"); // data/itens/<categoria>/<id>.json
const OUT_PATH = path.join("data", "compendium", "itens.json");

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

function listJsonFilesRecursively(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFilesRecursively(p));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const files = listJsonFilesRecursively(ITENS_DIR);

const items = [];
for (const filePath of files) {
  const raw = fs.readFileSync(filePath, "utf8");
  let item;
  try {
    item = JSON.parse(raw);
  } catch {
    console.warn("[IGNORADO] JSON inválido:", filePath);
    continue;
  }

  if (!item?.id || !item?.name) {
    console.warn("[IGNORADO] Sem id/name:", filePath);
    continue;
  }

  items.push({
    id: item.id,
    name: item.name,
    category: item.category ?? "", // importante pro fetch por pasta
    book: item.book ?? ""
  });
}

// ordenar por nome
items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const out = {
  id: "itens",
  title: "Itens",
  columns: ["Nome", "Categoria", "Livro"],
  items
};

fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
console.log(`✔ Gerado ${OUT_PATH} com ${items.length} itens`);
