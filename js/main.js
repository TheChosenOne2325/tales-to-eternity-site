import { loadHome } from "./pages/home.js";
import { loadBooks } from "./ui/books.js";
import { loadCompendiumNav } from "./ui/compendium.js";

window.addEventListener("DOMContentLoaded", () => {
  loadHome();
  loadBooks();
  loadCompendiumNav();
});
