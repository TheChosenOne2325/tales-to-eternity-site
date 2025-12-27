import { openCompendium } from "../pages/compendium.js";

export async function loadCompendiumNav() {
  const res = await fetch("data/compendium/index.json");
  const listData = await res.json();

  const ul = document.getElementById("compendium-list");
  ul.innerHTML = "";

  listData.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c.title;
    li.addEventListener("click", () => openCompendium(c.id));
    ul.appendChild(li);
  });
}
