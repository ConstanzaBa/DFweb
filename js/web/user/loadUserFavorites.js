import { TMDB_imgBaseUrl } from "../../utils/consts.js";
import { fetchConToken } from "../../utils/AuthFetch.js";

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let favoritos = [];

export async function loadUserFavorites(token) {
  const recientesContainer = document.getElementById("fav-movies");
  const favoritosContainer = document.getElementById("tab-only-favorites");
  const paginationContainer = document.getElementById("favorites-pagination");
  const favoritesCount = document.getElementById("profile-favorites");

  if (favoritesCount) favoritesCount.textContent = '…';

  try {
    const response = await fetchConToken("/Favoritos/GetFavoritoByUser.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error("Error al obtener favoritos");
    const data = await response.json();
    favoritos = data.favorites || [];

    if (favoritesCount) favoritesCount.textContent = favoritos.length;

    if (recientesContainer) {
      if (!favoritos.length) {
        recientesContainer.innerHTML = `<div class="empty-state"><p>No tienes películas favoritas</p></div>`;
      } else {
        const recientes = favoritos.slice(0, 10);
        recientesContainer.innerHTML = recientes.map(createFavoriteCard).join("");
        attachCardClicks(recientesContainer);
      }
    }

    if (favoritosContainer) renderFavoritesPage(favoritosContainer, paginationContainer);

  } catch (error) {
    console.error("Error cargando favoritos:", error);
    if (favoritesCount) favoritesCount.textContent = 0;
    if (recientesContainer) recientesContainer.innerHTML = `<div class="error-state"><p>Error al cargar tus favoritos</p></div>`;
  }
}

function renderFavoritesPage(favoritosContainer, paginationContainer) {
  if (!favoritos.length) {
    favoritosContainer.innerHTML = `<div class="empty-state"><p>No tienes películas favoritas</p></div>`;
    if (paginationContainer) paginationContainer.innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedItems = favoritos.slice(start, end);

  favoritosContainer.innerHTML = paginatedItems.map(createFavoriteCard).join("");
  attachCardClicks(favoritosContainer);

  const totalPages = Math.ceil(favoritos.length / ITEMS_PER_PAGE);
  if (paginationContainer) {
    paginationContainer.innerHTML = createPagination(totalPages);

    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        currentPage = parseInt(e.target.dataset.page, 10);
        renderFavoritesPage(favoritosContainer, paginationContainer);
      });
    });
  }
}

function createFavoriteCard(movie) {
  const posterPath = movie.poster_url
    ? `${TMDB_imgBaseUrl}${movie.poster_url}`
    : "source/img/no-poster.jpg";

  return `
    <div class="pelicula__card" data-id="${movie.pelicula_id}">
      <img src="${posterPath}" alt="${movie.titulo}" loading="lazy" />
      <section class="pelicula__card__info">
        <h1>${movie.titulo}</h1>
        <section class="pelicula__card__info__puntaje">
          <h2><i class="fa-brands fa-imdb"></i> ${movie.calificacion || "N/A"}</h2>
        </section>
      </section>
    </div>
  `;
}

function attachCardClicks(container) {
  container.querySelectorAll('.pelicula__card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.open(`/entrada.html?id=${id}`, '_blank');
    });
  });
}

function createPagination(totalPages) {
  let buttons = "";
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  return buttons;
}
