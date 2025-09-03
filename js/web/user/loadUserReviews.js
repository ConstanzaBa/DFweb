import { API_BASE_URL } from '../../utils/config.js';
import { fetchFromApi } from '../../api/components/FetchFromApi.js';

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserReviews();
});

const MAX_RECENTES = 10;
const MAX_RESEÑAS_SOLO = 10;

export async function loadUserReviews() {
  const containerRecientes = document.getElementById("user-reviews");
  const containerOnly = document.getElementById("tab-only-reviews");
  if (!containerRecientes && !containerOnly) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token no encontrado, por favor inicia sesión de nuevo");

    const response = await fetch(`${API_BASE_URL}/Review/GetReviewsByUser.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      credentials: "include"
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error HTTP al obtener reseñas:", response.status, text);
      throw new Error("Error al obtener reseñas");
    }

    const data = await response.json();
    let reviews = data.reviews || [];

    if (!reviews.length) {
      if (containerRecientes) containerRecientes.innerHTML = `<div class="empty-state"><p>No has escrito ninguna reseña</p></div>`;
      if (containerOnly) containerOnly.innerHTML = `<div class="empty-state"><p>No has escrito ninguna reseña</p></div>`;
      return;
    }

    reviews = await Promise.all(reviews.map(async (review) => {
      const movieId = review.id_pelicula || review.movie_id || review.pelicula_id;
      if (!movieId) return { ...review, nombre_pelicula: "Película desconocida", poster_path: null };

      try {
        const movie = await fetchFromApi.movieDetails(movieId);
        return { 
          ...review, 
          nombre_pelicula: movie.title || movie.name || "Película", 
          poster_path: movie.poster_path || null 
        };
      } catch {
        return { ...review, nombre_pelicula: "Película desconocida", poster_path: null };
      }
    }));

    // Carousel: pequeñas
    if (containerRecientes) {
      const recientes = reviews.slice(0, MAX_RECENTES);
      containerRecientes.innerHTML = recientes.map(r => createReviewCard(r, 'carousel')).join("");
    }

    // Página reseñas solas: grandes
    if (containerOnly) {
      renderPaginatedReviewsVertical(containerOnly, reviews, MAX_RESEÑAS_SOLO);
    }

    const reviewsCount = document.getElementById("profile-reviews");
    if (reviewsCount) reviewsCount.textContent = reviews.length;

  } catch (error) {
    console.error("Error cargando reseñas:", error);
  }
}

// Crear card con tamaño según contexto
function createReviewCard(review, size='page') {
  const stars = createStars(review.puntuacion || 0);
  const movieId = review.id_pelicula || review.movie_id || review.pelicula_id;
  const posterUrl = review.poster_path 
      ? `https://image.tmdb.org/t/p/w200${review.poster_path}` 
      : 'source/img/no-poster.jpg';

  return `
    <div class="review-card ${size}">
      <div class="review-left">
        <a href="https://dragonfilms.space/web/entrada.html?id=${movieId}" target="_blank">
          <img src="${posterUrl}" alt="${review.nombre_pelicula}" />
        </a>
        <h3 class="review-movie-title">${review.nombre_pelicula}</h3>
      </div>
      <div class="review-right">
        <div class="review-title">${review.titulo || ''}</div>
        <div class="average-stars">${stars}</div>
        <p class="review-text">${review.review || ''}</p>
      </div>
    </div>
  `;
}

function renderPaginatedReviewsVertical(container, reviews, perPage) {
  let currentPage = 1;
  const totalPages = Math.ceil(reviews.length / perPage);

  function showPage(page) {
    currentPage = page;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    container.innerHTML = reviews.slice(start, end).map(r => createReviewCard(r, 'page')).join("");
    renderPaginationControls();
  }

  function renderPaginationControls() {
    const pagination = container.nextElementSibling;
    if (!pagination) return;
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === currentPage ? 'active' : '';
      btn.addEventListener('click', () => showPage(i));
      pagination.appendChild(btn);
    }
  }

  showPage(1);
}

function createStars(score) {
  const maxStars = 5;
  let starsHtml = "";
  for (let i = 1; i <= maxStars; i++) {
    starsHtml += `<span class="star ${i <= score ? "filled" : ""}">★</span>`;
  }
  return starsHtml;
}
