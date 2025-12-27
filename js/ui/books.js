import { openBook } from "../pages/book.js";
import { openChapter } from "../pages/chapter.js";

export async function loadBooks() {
  const res = await fetch("data/livros/index.json");
  const books = await res.json();

  const list = document.getElementById("books-list");
  list.innerHTML = "";

  books.forEach(book => {
    const li = document.createElement("li");
    li.className = "book-node";

    const header = document.createElement("div");
    header.className = "book-node-header";
    header.textContent = book.title;

    const children = document.createElement("ul");
    children.className = "book-children";
    children.style.display = "none";

    header.addEventListener("click", async () => {
      // abre capa
      openBook(book.id);

      // toggle capítulos
      const open = children.style.display === "block";
      children.style.display = open ? "none" : "block";

      // carrega capítulos só uma vez
      if (!children.dataset.loaded) {
        const r = await fetch(`data/livros/${book.id}.json`);
        const fullBook = await r.json();

        (fullBook.chapters ?? []).forEach(ch => {
          const cLi = document.createElement("li");
          cLi.className = "chapter-item";
          cLi.textContent = ch.title;
          cLi.addEventListener("click", (e) => {
            e.stopPropagation();
            openChapter(ch.file);
          });
          children.appendChild(cLi);
        });

        children.dataset.loaded = "1";
      }
    });

    li.appendChild(header);
    li.appendChild(children);
    list.appendChild(li);
  });
}
