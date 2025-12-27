export async function openCompendium(compendiumId) {
  const res = await fetch(`data/compendium/${compendiumId}.json`);
  const data = await res.json();

  const content = document.getElementById("content");
  const details = document.getElementById("details");

  // centro: lista
  content.classList.remove("is-cover");
  content.innerHTML = `
    <div class="compendium">
      <h1>${data.title}</h1>
      <div class="compendium-table">
        <div class="row head">
          ${data.columns.map(c => `<div class="cell">${c}</div>`).join("")}
        </div>
        ${data.items.map(item => `
  <div class="row item" data-id="${item.id}">
    <div class="cell">${item.name}</div>
    <div class="cell">${item.book ?? ""}</div>
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
const resItem = await fetch(`data/${compendiumId}/${id}.json`);
const item = await resItem.json();

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
const hasImage = !!item.img;

details.innerHTML = `
  <h2>${item.name}</h2>
  <p><strong>Livro:</strong> ${item.book ?? ""}</p>

${(hasImage || isClass) ? `
  <div class="tabs">
    <button class="tab-btn active" data-tab="desc">Descrição</button>
    ${isClass ? `<button class="tab-btn" data-tab="spec">Especializações</button>` : ""}
    ${hasImage ? `<button class="tab-btn" data-tab="img">Imagem</button>` : ""}
  </div>
` : ""}

  <div class="tab-content">
    <div class="tab-panel active" data-panel="desc">
      ${
        item.blocks
          ? renderBlocks(item.blocks)
          : (item.text ?? []).map(p => `<p>${p}</p>`).join("")
      }
    </div>

${isClass ? `
  <div class="tab-panel" data-panel="spec">
    ${specs.length ? `
      <div class="spec-list">
        ${specs.map(s => `
          <button class="spec-pill" data-spec="${s.id}">${s.name}</button>
        `).join("")}
      </div>
      <div class="spec-preview">
        <p>Clique em uma especialização.</p>
      </div>
    ` : `<p>Sem especializações cadastradas.</p>`}
  </div>
` : ""}

    ${hasImage ? `
      <div class="tab-panel" data-panel="img">
        <img class="compendium-img" src="${item.img}" alt="${item.name}">
      </div>
    ` : ""}
  </div>
`;
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
