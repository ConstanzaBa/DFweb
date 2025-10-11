import { TMDB_imgBaseUrl, getBestPosterForLanguage } from "../../utils/consts.js";
import { translate, updateTranslations, getCurrentLanguage } from "../../utils/i18n.js";
import { fetchFromApi } from "../../api/components/FetchFromApi.js";
import { getFavoritosByUser } from "../../api/endpoints/GetFavoritoByUser.js";
import { showError } from "./ShowError.js"; // Solo muestra mensaje al usuario, sin exponer datos técnicos

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let favoritos = []; // Cache local para recargar sin nueva petición

// ====================== EVENTOS ======================

// Actualiza traducciones y posters al cambiar de idioma
document.addEventListener("languageChanged", () => {
  updateTranslations();
  updateFavoritePosters();
});

// ====================== CARGAR FAVORITOS ======================

export async function loadUserFavorites() {
  const recientesContainer = document.getElementById("fav-movies");
  const favoritosContainer = document.getElementById("tab-only-favorites");
  const paginationContainer = document.getElementById("favorites-pagination");
  const favoritesCount = document.getElementById("profile-favorites");

  if (favoritesCount) favoritesCount.textContent = "…";

  try {
    const data = await getFavoritosByUser();
    if (!data.success) throw new Error(data.error || "errorLoadingFavorites");

    let rawFavoritos = data.favorites || [];

    // Obtener detalles de TMDB para cada favorito
    favoritos = await Promise.all(
      rawFavoritos.map(async (movie) => {
        try {
          const movieDetails = await fetchFromApi.movieDetails(movie.pelicula_id);
          return {
            ...movie,
            poster_path: movieDetails.poster_path,
            images: movieDetails.images,
            titulo: movieDetails.title || movie.titulo || translate("unknownMovie"),
            calificacion: movieDetails.vote_average || movie.calificacion || "N/A",
          };
        } catch {
          return {
            ...movie,
            poster_path: movie.poster_url,
            images: null,
            titulo: movie.titulo || translate("unknownMovie"),
            calificacion: movie.calificacion || "N/A",
          };
        }
      })
    );

    if (favoritesCount) favoritesCount.textContent = favoritos.length;

    // Carousel (últimos 10)
    if (recientesContainer) {
      if (!favoritos.length) {
        recientesContainer.innerHTML = `
          <div class="empty-state">
            <p data-translate="noFavorites">No tienes películas favoritas</p>
          </div>`;
        updateTranslations();
      } else {
        const recientes = favoritos.slice(0, 10);
        recientesContainer.innerHTML = recientes.map(createFavoriteCard).join("");
        attachCardClicks(recientesContainer);
      }
    }

    // Página de favoritos (con paginación)
    if (favoritosContainer) renderFavoritesPage(favoritosContainer, paginationContainer);
  } catch (error) {
    console.error("Error cargando favoritos:", error);
    if (favoritesCount) favoritesCount.textContent = 0;
    showError(translate("errorLoadingFavorites"), "error");
    if (recientesContainer) {
      recientesContainer.innerHTML = `
        <div class="error-state">
          <p data-translate="errorLoadingFavorites">Error al cargar tus favoritos</p>
        </div>`;
      updateTranslations();
    }
  }
}

// ====================== CREAR TARJETA FAVORITO ======================

function createFavoriteCard(movie) {
  let posterPath = "source/img/no-poster.jpg";

  if (movie.images?.posters?.length > 0) {
    const bestPoster = getBestPosterForLanguage(movie.images, getCurrentLanguage());
    if (bestPoster) posterPath = `${TMDB_imgBaseUrl}${bestPoster.file_path}`;
  } else if (movie.poster_path) {
    posterPath = `${TMDB_imgBaseUrl}${movie.poster_path}`;
  }

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

// ====================== CLICK TARJETA ======================

function attachCardClicks(container) {
  container.querySelectorAll(".pelicula__card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.open(`/entrada.html?id=${id}`, "_blank");
    });
  });
}

// ====================== PAGINACIÓN ======================

function renderFavoritesPage(favoritosContainer, paginationContainer) {
  if (!favoritos.length) {
    favoritosContainer.innerHTML = `
      <div class="empty-state">
        <p data-translate="noFavorites">No tienes películas favoritas</p>
      </div>`;
    updateTranslations();
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
    paginationContainer.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        currentPage = parseInt(e.target.dataset.page, 10);
        renderFavoritesPage(favoritosContainer, paginationContainer);
      });
    });
  }
}

function createPagination(totalPages) {
  let buttons = "";
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  return buttons;
}

// ====================== ACTUALIZAR POSTERS AL CAMBIAR IDIOMA ======================

function updateFavoritePosters() {
  const recientesContainer = document.getElementById("fav-movies");
  const favoritosContainer = document.getElementById("tab-only-favorites");
  const paginationContainer = document.getElementById("favorites-pagination");

  if (!favoritos.length) return;

  // Actualizar carousel
  if (recientesContainer) {
    const recientes = favoritos.slice(0, 10);
    recientesContainer.innerHTML = recientes.map(createFavoriteCard).join("");
    attachCardClicks(recientesContainer);
  }

  // Actualizar página con paginación
  if (favoritosContainer) {
    renderFavoritesPage(favoritosContainer, paginationContainer);
  }
}
