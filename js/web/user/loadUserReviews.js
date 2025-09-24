import { API_BASE_URL } from '../../utils/config.js';
import { fetchFromApi } from '../../api/components/FetchFromApi.js';
import { deleteReview } from '../../api/endpoints/DeleteReview.js';
import { showError } from './ShowError.js';
import { translate, updateTranslations } from '../../utils/i18n.js';

const MAX_RECENTES = 10;
const MAX_RESEÑAS_SOLO = 10;

// Listen for language changes to update translations
document.addEventListener('languageChanged', () => {
  updateTranslations();
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  await loadUserReviews(token);
});

export async function loadUserReviews(token) {
  const containerRecientes = document.getElementById("user-reviews");
  const containerOnly = document.getElementById("tab-only-reviews");
  const reviewsCount = document.getElementById("profile-reviews");

  if (reviewsCount) reviewsCount.textContent = '…';
  if (!containerRecientes && !containerOnly) return;

  try {
    const response = await fetch(`${API_BASE_URL}/Review/GetReviewsByUser.php`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      credentials: "include"
    });

    if (!response.ok) throw new Error(translate("errorLoadingReviews"));
    const data = await response.json();
    let reviews = data.reviews || [];

    if (reviewsCount) reviewsCount.textContent = reviews.length;

    if (!reviews.length) {
      const emptyHtml = `<div class="empty-state"><p data-translate="noReviews">No has escrito ninguna reseña</p></div>`;
      if (containerRecientes) containerRecientes.innerHTML = emptyHtml;
      if (containerOnly) containerOnly.innerHTML = emptyHtml;
      updateTranslations();
      return;
    }

    // Obtener detalles de películas
    reviews = await Promise.all(reviews.map(async (review) => {
      const movieId = review.id_pelicula || review.movie_id || review.pelicula_id;
      if (!movieId) return { ...review, poster_path: null, nombre_pelicula: "Película desconocida" };
      try {
        const movie = await fetchFromApi.movieDetails(movieId);
        return { ...review, poster_path: movie.poster_path || null };
      } catch {
        return { ...review, poster_path: null };
      }
    }));

    // Carousel (últimas reseñas)
    if (containerRecientes) {
      const recientes = reviews.slice(0, MAX_RECENTES);
      containerRecientes.innerHTML = recientes.map(r => createReviewCard(r, 'carousel')).join("");
      updateTranslations();
    }

    // Página reseñas verticales
    if (containerOnly) {
      renderPaginatedReviewsVertical(containerOnly, reviews, MAX_RESEÑAS_SOLO);
    }

  } catch (error) {
    console.error("Error cargando reseñas:", error);
    if (reviewsCount) reviewsCount.textContent = 0;
  }
}

// ====================== FUNCIONES AUXILIARES ======================

function createStars(score) {
  const maxStars = 5;
  let starsHtml = "";
  for (let i = 1; i <= maxStars; i++) {
    starsHtml += `<span class="star ${i <= score ? "filled" : ""}">★</span>`;
  }
  return starsHtml;
}

function createReviewCard(review, size = 'page') {
  const stars = createStars(review.puntuacion || 0);
  const movieId = review.id_pelicula || review.movie_id || review.pelicula_id;
  const posterUrl = review.poster_path 
      ? `https://image.tmdb.org/t/p/w200${review.poster_path}` 
      : 'source/img/no-poster.jpg';

  const actionsMenu = size === 'page' ? `
    <div class="review-actions">
      <span class="material-symbols-outlined actions-icon">more_vert</span>
      <div class="actions-dropdown">
        <button class="edit-review-btn" data-translate="editReview">Editar</button>
        <button class="delete-review-btn" data-translate="deleteReview">Eliminar</button>
      </div>
    </div>
  ` : '';

  return `
    <div class="review-card ${size}" data-movie-id="${movieId}">
      <div class="review-left">
        <a href="/entrada.html?id=${movieId}" target="_blank">
          <img src="${posterUrl}" alt="${review.titulo || 'poster'}" />
        </a>
        ${size === 'page' ? `<div class="review-movie-title">${review.nombre_pelicula || ''}</div>` : ''}
      </div>
      <div class="review-right">
        <div class="review-title">${review.titulo || ''}</div>
        <div class="average-stars">${stars}</div>
        <p class="review-text">${review.review || ''}</p>
      </div>
      ${actionsMenu}
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
    updateTranslations();
    attachReviewActions(container);
    renderPaginationControls();
  }

  function renderPaginationControls() {
    let pagination = container.nextElementSibling;
    if (!pagination) {
      pagination = document.createElement('div');
      pagination.className = 'pagination';
      container.parentNode.insertBefore(pagination, container.nextSibling);
    }
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

// ====================== ACCIONES EDITAR / ELIMINAR ======================

function attachReviewActions(container) {
  container.querySelectorAll('.review-card').forEach(card => {
    const actions = card.querySelector('.review-actions');
    if (!actions) return;

    const icon = actions.querySelector('.actions-icon');
    const deleteBtn = actions.querySelector('.delete-review-btn');
    const editBtn = actions.querySelector('.edit-review-btn');

    icon.addEventListener('click', () => {
      actions.classList.toggle('show');
    });

    deleteBtn.addEventListener('click', async () => {
      const movieId = card.dataset.movieId;
      const res = await deleteReview(movieId);
      if (res.success) {
        card.remove();
        showError(translate('reviewDeleted'), 'success');
      } else {
        showError(translate('errorDeletingReview') + ': ' + (res.message || res.error), 'error');
      }
    });

    editBtn.addEventListener('click', () => {
      const movieId = card.dataset.movieId;
      // Abre la página en una nueva ventana o pestaña
      window.open(
        `/entrada.html?id=${movieId}&editReview=1`,
        '_blank'
      );
    });
  });
}
