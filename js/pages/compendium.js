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
    row.addEventListener("click", () => {
      const id = row.dataset.id;
      const item = data.items.find(x => x.id === id);
      if (!item) return;

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

details.innerHTML = `
  <h2>${item.name}</h2>
  <p><strong>Livro:</strong> ${item.book ?? ""}</p>
 ${item.blocks
  ? renderBlocks(item.blocks)
  : (item.text ?? []).map(p => `<p>${p}</p>`).join("")
}
${item.img ? `<img class="compendium-img" src="${item.img}" alt="${item.name}">` : ""}
`;
    });
  });
}
