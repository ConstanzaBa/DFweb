import { TMDB_imgBaseUrl } from "./utils/consts.js";
import { getCurrentLanguage, setupLanguageToggle, changeLanguage } from "./web/components/LanguageToggle.js";
import { getMovieId } from "./movies.js";
import { initializeCarousel, resetCarouselRotation } from "./web/components/MediaDisplay.js";
import { fetchFromApi } from "./api/components/FetchFromApi.js";
import { setupSearchHandlers } from "./web/components/SearchBar.js";
import { getRecommendationsByUser } from "./web/user/Recommendations.js"; // solo la función, no createMovieCard

let language = getCurrentLanguage();

document.addEventListener("DOMContentLoaded", async () => {
  setupLanguageToggle();
  setupSearchHandlers();

  initializeCarousel();
  loadAllMovieCategories();

  loadUserRecommendations();
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

  container.innerHTML = '';
  movies.forEach(movie => {
    container.appendChild(createMovieCard(movie));
  });
}

function createMovieCard(movie) {
  const posterPath = movie.poster_path 
    ? `${TMDB_imgBaseUrl}${movie.poster_path}`
    : "source/img/no-poster.jpg";

  const card = document.createElement('div');
  card.className = "pelicula__card";

  const link = document.createElement('a');
  link.className = "pelicula__card__link";
  link.href = `entrada.html?id=${movie.id}`;
  card.appendChild(link);

  const img = document.createElement('img');
  img.src = "source/img/placeholder.jpg";
  img.alt = movie.title;

  const actualImage = new Image();
  actualImage.src = posterPath;
  actualImage.onload = () => img.src = posterPath;
  link.appendChild(img);

  const infoSection = document.createElement('section');
  infoSection.className = "pelicula__card__info";

  const title = document.createElement('h1');
  title.textContent = movie.title;
  infoSection.appendChild(title);

  const scoreSection = document.createElement('section');
  scoreSection.className = "pelicula__card__info__puntaje";

  const score = document.createElement('h2');
  score.innerHTML = `<i class="fa-brands fa-imdb"></i> ${movie.vote_average || "N/A"}`;
  scoreSection.appendChild(score);

  infoSection.appendChild(scoreSection);
  link.appendChild(infoSection);

  return card;
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

async function loadUserRecommendations() {
  const container = document.getElementById("user-recommendations");
  const section = document.querySelector(".headings"); // sección completa
  if (!container || !section) return;

  const token = localStorage.getItem("token");
  if (!token) {
    // No hay usuario autenticado → ocultar sección
    section.style.display = "none";
    return;
  }

  try {
    const recommendedMovies = await getRecommendationsByUser();

    if (!recommendedMovies.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No hay recomendaciones disponibles por el momento</p>
        </div>
      `;
      return;
    }

    // Mostrar la sección solo si hay recomendaciones
    section.style.display = "block";
    container.innerHTML = "";
    recommendedMovies.forEach(movie => {
      const card = createMovieCard(movie);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error al cargar recomendaciones del usuario:", error);
    container.innerHTML = `
      <div class="error-state">
        <p>Error al cargar recomendaciones</p>
        <p>Por favor, intenta de nuevo más tarde</p>
      </div>
    `;
  }
}
