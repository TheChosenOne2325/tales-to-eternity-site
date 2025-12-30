export async function openCompendium(compendiumId) {
  const res = await fetch(`data/compendium/${compendiumId}.json`);
  const data = await res.json(); // ✅ FALTAVA ISSO

  const getCell = (rowItem, col) => {
    const c = String(col ?? "").toLowerCase();
    if (c.includes("nome")) return rowItem.name ?? "";
    if (c.includes("categoria")) return rowItem.category ?? "";
    if (c.includes("livro")) return rowItem.book ?? "";
    return "";
  };

  const content = document.getElementById("content");
  const details = document.getElementById("details");
  // centro: lista
  content.classList.remove("is-cover");
  content.innerHTML = `
    <div class="compendium">
      <h1>${data.title}</h1>
      <div class="compendium-table" style="--cols:${data.columns.length}">
        <div class="row head">
          ${data.columns.map(c => `<div class="cell">${c}</div>`).join("")}
        </div>

${data.items.map(rowItem => `
  <div class="row item" data-id="${rowItem.id}">
    ${data.columns.map(col => `<div class="cell">${getCell(rowItem, col)}</div>`).join("")}
  </div>
`).join("")}


      </div>
    </div>
  `;

  // direita: vazio/placeholder
  details.innerHTML = `
    <h2>${data.title}</h2>
    <p>Clique em um item para ver os detalhes.</p>

    `;

  // clique -> detalhes
  content.querySelectorAll(".row.item").forEach(row => {
    row.addEventListener("click", async () => {
      const id = row.dataset.id;
      const indexItem = data.items.find(x => x.id === id);
if (!indexItem) return;
let url = `data/${compendiumId}/${id}.json`;

// CASO ESPECIAL: ITENS
if (compendiumId === "itens") {
  if (!indexItem.category) {
    details.innerHTML = `<p>Item sem categoria no índice.</p>`;
    return;
  }
  url = `data/itens/${indexItem.category}/${id}.json`;
}

const resItem = await fetch(url);
if (!resItem.ok) {
  details.innerHTML = `<p>Não achei: ${url}</p>`;
  return;
}
const item = await resItem.json();
 const inlineImgCompendiums = ["itens", "moedas", "evolucoes","descanso"];
  const isInlineImg = inlineImgCompendiums.includes(compendiumId);

      const renderInline = (s) =>
  String(s ?? "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

const renderBlocks = (blocks = []) => blocks.map(b => {
  if (b.type === "h2") return `<h2>${renderInline(b.text)}</h2>`;
  if (b.type === "h3") return `<h3>${renderInline(b.text)}</h3>`;
  if (b.type === "rules") {
    const items = Array.isArray(b.items) ? b.items : [];
    return `
      <div class="rules-box">
        <ul>
          ${items.map(i => `<li>${renderInline(i)}</li>`).join("")}
        </ul>
      </div>
    `;
  }
  if (b.text) return `<p>${renderInline(b.text)}</p>`;
  return "";
}).join("");

const isClass = compendiumId === "classes"; // como já está
const specs = Array.isArray(item.specializations) ? item.specializations : [];
const specsSorted = specs.slice().sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
const hasImage = !!item.img;

details.innerHTML = `
  <h2>${item.name}</h2>
  <p><strong>Livro:</strong> ${item.book ?? ""}</p>

${(hasImage || isClass) ? `
  <div class="tabs">
    <button class="tab-btn active" data-tab="desc">Descrição</button>
    ${isClass ? `<button class="tab-btn" data-tab="spec">Especializações</button>` : ""}
    ${item.img && !isInlineImg
  ? `<button class="tab-btn" data-tab="img">Imagem</button>`
  : ""
}
  </div>
` : ""}

  <div class="tab-content">
    <div class="tab-panel active" data-panel="desc">
      ${
        item.blocks
          ? renderBlocks(item.blocks)
          : (item.text ?? []).map(p => `<p>${p}</p>`).join("")
      }
      ${item.img && isInlineImg ? `
  <img class="compendium-img" src="${item.img}" alt="${item.name}">
` : ""}
    </div>

${isClass ? `
  <div class="tab-panel" data-panel="spec">
    ${specsSorted.length ? `
      <div class="spec-list">
        ${specsSorted.map(s => `<button class="spec-pill" data-spec="${s.id}">${s.name}</button>`).join("")}
      </div>
      <div class="spec-preview"><p>Clique em uma especialização.</p></div>
    ` : `<p>Sem especializações cadastradas.</p>`}
  </div>
` : ""}

  ${item.img && !isInlineImg ? `
  <div class="tab-panel" data-panel="img">
    <img class="compendium-img" src="${item.img}" alt="${item.name}">
  </div>
` : ""}

  </div>
`
if (isClass) {
  const preview = details.querySelector(".spec-preview");

  details.querySelectorAll(".spec-pill").forEach(btn => {
    btn.addEventListener("click", async () => {
      const specId = btn.dataset.spec;

      details.querySelectorAll(".spec-pill").forEach(b =>
        b.classList.toggle("active", b === btn)
      );

      preview.innerHTML = `<p>Carregando...</p>`;

      const url = `data/especializacoes/${specId}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        preview.innerHTML = `<p>Não achei: ${url}</p>`;
        return;
      }
      const spec = await res.json();

      const renderInline = (s) =>
        String(s ?? "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      const renderBlocks = (blocks = []) => blocks.map(b => {
        if (b.type === "h2") return `<h2>${renderInline(b.text)}</h2>`;
        if (b.type === "h3") return `<h3>${renderInline(b.text)}</h3>`;
        if (b.type === "rules") {
          const items = Array.isArray(b.items) ? b.items : [];
          return `<div class="rules-box"><ul>${items.map(i => `<li>${renderInline(i)}</li>`).join("")}</ul></div>`;
        }
        if (b.text) return `<p>${renderInline(b.text)}</p>`;
        return "";
      }).join("");

      preview.innerHTML = `
        <h3>${spec.name}</h3>
        ${renderBlocks(spec.blocks || [])}
      ${spec.img ? `
  <img class="compendium-img" src="${spec.img}" alt="${spec.name}">
` : ""}
      `;
    });
  });
};
details.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    details.querySelectorAll(".tab-btn").forEach(b =>
      b.classList.toggle("active", b === btn)
    );

    details.querySelectorAll(".tab-panel").forEach(p =>
      p.classList.toggle("active", p.dataset.panel === tab)
    );
  });
});

    });
  });
}
