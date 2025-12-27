import { openCompendium } from "./compendium.js";

export async function openChapter(chapterFile) {
  const res = await fetch(chapterFile);
  const chapter = await res.json();

  const content = document.getElementById("content");
  const details = document.getElementById("details");

  // remove modo capa (permite scroll)
  content.classList.remove("is-cover");

  let headingIndex = 0;

  // render do conteúdo + ids nos títulos
const html = chapter.blocks.map(b => {

  if (b.type === "h2") {
    return `<h2 id="h${headingIndex++}">${b.text}</h2>`;
  }

  if (b.type === "h3") {
    return `<h3 id="h${headingIndex++}">${b.text}</h3>`;
  }

  if (b.type === "rules") {
    const items = Array.isArray(b.items) ? b.items : [];
    return `
      <div class="rules-box">
        <ul>
          ${items.map(i => `<li>${i}</li>`).join("")}
        </ul>
      </div>
    `;
  }
if (b.type === "note") {
  return `
    <div class="note-box">
      ${b.title ? `<div class="note-title">${b.title}</div>` : ""}
      <div class="note-text">${b.text ?? ""}</div>
    </div>
  `;
}
if (b.type === "olist") {
  const items = Array.isArray(b.items) ? b.items : [];
  return `
    <ol class="olist">
      ${items.map(i => `<li>${i}</li>`).join("")}
    </ol>
  `;
}

  // fallback seguro (NUNCA imprime undefined)
 if (b.text) {
  const withLinks = b.text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" class="inline-link">$1</a>`
  );
  return `<p>${withLinks}</p>`;
}


  return ""; // ← isso impede qualquer "undefined"
}).join("");

  content.innerHTML = `
    <div class="chapter">
      ${html}
    </div>
  `;
  content.querySelectorAll('a.inline-link[href^="compendium:"]').forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("href").replace("compendium:", "");
    openCompendium(id);
  });
});


  // monta índice do capítulo (direita)
  const toc = chapter.blocks
    .filter(b => b.type === "h2" || b.type === "h3")
    .map((b, i) => ({ text: b.text, idx: i }));

  details.innerHTML = `
    <h2>${chapter.title}</h2>
    <p>Ecos do Cosmos</p>
    <hr>
    <h3>Índice</h3>
    <ul class="toc">
      ${toc.map(t => `<li data-idx="${t.idx}">${t.text}</li>`).join("")}
    </ul>
  `;

  // clique no índice → scroll até o título
  details.querySelectorAll(".toc li").forEach(li => {
    li.addEventListener("click", () => {
      const el = document.getElementById(`h${li.dataset.idx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}
