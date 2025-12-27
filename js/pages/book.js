export async function openBook(bookId) {
  try {
    const res = await fetch(`data/livros/${bookId}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status} em data/livros/${bookId}.json`);

    const book = await res.json();
    console.log("Abrindo livro:", book);

 content.innerHTML = `
  <div class="book-cover-wrapper">
    <img 
      class="book-cover-full"
      src="${book.cover}"
      alt="${book.title}"
    >
  </div>
`;

    document.getElementById("details").innerHTML = `
      <h2>${book.title}</h2>
       ${(book.intro ?? []).map(p => `<p>${p}</p>`).join("")}
`;
  } catch (err) {
    console.error("Falha ao abrir livro:", err);
  }
}
