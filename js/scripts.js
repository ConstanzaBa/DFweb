import { TMDB_imgBaseUrl } from "./utils/consts.js";
import { getCurrentLanguage, setupLanguageToggle, changeLanguage } from "./web/components/LanguageToggle.js";
import { getMovieId } from "./movies.js";
import { initializeCarousel, resetCarouselRotation } from "./web/components/MediaDisplay.js";
import { fetchFromApi } from "./api/components/FetchFromApi.js";
import { setupSearchHandlers } from "./web/components/SearchBar.js";

let language = getCurrentLanguage();

document.addEventListener("DOMContentLoaded", async () => {
  setupLanguageToggle();
  setupSearchHandlers();
  
  initializeCarousel();
  loadAllMovieCategories();
});

document.addEventListener('languageChanged', (event) => {
  language = event.detail.language;
  
  refreshContent();
  resetCarouselRotation();
});

function refreshContent() {
  loadAllMovieCategories();
  const currentMovieId = getMovieId();
  if (currentMovieId) {
    fetchMovies(`movie/${currentMovieId}`, "pelicula__info");
  }
}

function loadAllMovieCategories() {
  const categories = [
    { endpoint: "movie/popular", containerId: "popular-movies" },
    { endpoint: "movie/now_playing", containerId: "now-playing-movies" },
    { endpoint: "movie/top_rated", containerId: "top-rated-movies" },
    { endpoint: "movie/upcoming", containerId: "upcoming-movies" }
  ];
  
  categories.forEach(category => fetchMovies(category.endpoint, category.containerId));
}

async function fetchMovies(endpoint, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const data = await fetchFromApi(endpoint, {
      append_to_response: "videos,images,credits"
    });
    
    if (data.results) {
      displayMovies(data.results, containerId);
    } else {
      displayMovieDetails(data, containerId);
    }
  } catch (error) {
    console.error(`Error al obtener películas de ${endpoint}:`, error);
    container.innerHTML = `
      <div class="error-state">
        <p>Error al cargar el contenido</p>
        <p>Por favor, intenta de nuevo más tarde</p>
      </div>
    `;
  }
}

function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!movies.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron películas</p>
      </div>
    `;
    return;
  }

  container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

function createMovieCard(movie) {
  const posterPath = movie.poster_path 
    ? `${TMDB_imgBaseUrl}${movie.poster_path}`
    : "source/img/no-poster.jpg";
  
  return `
    <div class="pelicula__card">
      <a class="pelicula__card__link" href="entrada.html?id=${movie.id}">
        <img src="${posterPath}" alt="${movie.title}" loading="lazy" />
        <section class="pelicula__card__info">
          <h1>${movie.title}</h1>
          <section class="pelicula__card__info__puntaje">
            <h2><i class="fa-brands fa-imdb"></i> ${movie.vote_average || "N/A"}</h2>
          </section>
        </section>
      </a>
    </div>
  `;
}

function displayMovieDetails(movie, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const backdropPath = movie.backdrop_path 
    ? `${TMDB_imgBaseUrl}${movie.backdrop_path}`
    : "source/img/no-backdrop.jpg";

  container.innerHTML = `
    <div class="pelicula__detalle">
      <div class="pelicula__detalle__header" style="background-image: url('${backdropPath}')">
        <div class="pelicula__detalle__header__content">
          <h1>${movie.title}</h1>
          <div class="pelicula__detalle__header__info">
            <span>${movie.release_date?.split('-')[0] || 'N/A'}</span>
            <span>${movie.runtime || 'N/A'} min</span>
            <span>${movie.vote_average || 'N/A'}/10</span>
          </div>
        </div>
      </div>
      <div class="pelicula__detalle__content">
        <p>${movie.overview || 'No hay descripción disponible.'}</p>
      </div>
    </div>
  `;
}