export async function loadHome() {
  const res = await fetch("data/pages/home.json");
  const data = await res.json();

  const content = document.getElementById("content");
  const details = document.getElementById("details");

  content.innerHTML = `
    <h1 class="home-link">${data.title}</h1>
    ${data.content.map(p => `<p>${p}</p>`).join("")}
  `;

  details.innerHTML = `
    <h2>Bem-vindo</h2>
    <p>Explore os livros ou o compendium para começar.</p>
  `;

  content.querySelector(".home-link").onclick = loadHome;
}
