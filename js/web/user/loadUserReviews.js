import { API_BASE_URL } from '../../utils/config.js';
import { fetchFromApi } from '../../api/components/FetchFromApi.js';
import { deleteReview } from '../../api/endpoints/DeleteReview.js';
import { showError } from './ShowError.js';
import { translate, updateTranslations, getCurrentLanguage } from '../../utils/i18n.js';
import { TMDB_imgBaseUrl, getBestPosterForLanguage } from '../../utils/consts.js';

const MAX_RECENTES = 10;
const MAX_RESEÑAS_SOLO = 10;

let cachedReviews = []; // Guardar reseñas en memoria para actualización de idioma
const translationCache = new Map(); // Cache de traducciones

// ====================== FUNCIONES AUXILIARES ======================

async function traducirTexto(texto, idiomaDestino) {
    if (!texto || texto.trim() === "") return texto;
    const cacheKey = `${texto}|${idiomaDestino}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${idiomaDestino === 'en' ? 'es|en' : 'en|es'}`
        );
        const data = await response.json();
        const translatedText = data?.responseData?.translatedText || texto;
        translationCache.set(cacheKey, translatedText);
        return translatedText;
    } catch (err) {
        console.warn("Error al traducir texto:", err);
        return texto;
    }
}

function createStars(score) {
    const maxStars = 5;
    let starsHtml = "";
    for (let i = 1; i <= maxStars; i++) {
        starsHtml += `<span class="star ${i <= score ? "filled" : ""}">★</span>`;
    }
    return starsHtml;
}

// ====================== CREAR TARJETA DE RESEÑA ======================

function createReviewCard(review, size = 'page') {
    const stars = createStars(review.puntuacion || 0);
    const movieId = review.id_pelicula || review.movie_id || review.pelicula_id;

    // ====================== POSTER ======================
    let posterUrl = 'source/img/no-poster.jpg';
    if (review.images?.posters?.length > 0) {
        const bestPoster = getBestPosterForLanguage(review.images, getCurrentLanguage());
        if (bestPoster) posterUrl = `${TMDB_imgBaseUrl}${bestPoster.file_path}`;
    } else if (review.poster_path) {
        posterUrl = `${TMDB_imgBaseUrl}${review.poster_path}`;
    }

    // ====================== ACCIONES ======================
    const actionsMenu = size === 'page' ? `
    <div class="review-actions">
      <span class="material-symbols-outlined actions-icon">more_vert</span>
      <div class="actions-dropdown">
        <button class="edit-review-btn" data-translate="editReview">Editar</button>
        <button class="delete-review-btn" data-translate="deleteReview">Eliminar</button>
      </div>
    </div>
    ` : '';

    // ====================== HTML ======================
    const div = document.createElement('div');
    div.className = `review-card ${size}`;
    div.dataset.movieId = movieId;

    div.innerHTML = `
      <div class="review-left">
        <a href="/entrada.html?id=${movieId}" target="_blank">
          <img src="${posterUrl}" alt="${review.titulo || 'poster'}" />
        </a>
      </div>
      <div class="review-right">
        <div class="review-title" data-original="${review.titulo || ''}" data-lang="${review.lang || 'es'}">${review.titulo || ''}</div>
        <div class="average-stars">${stars}</div>
        <p class="review-text" data-original="${review.review || ''}" data-lang="${review.lang || 'es'}">${review.review || ''}</p>
      </div>
      ${actionsMenu}
    `;

    return div;
}

// ====================== RENDER PAGINADO VERTICAL ======================

function renderPaginatedReviewsVertical(container, reviews, perPage) {
    let currentPage = 1;
    const totalPages = Math.ceil(reviews.length / perPage);

    function showPage(page) {
        currentPage = page;
        const start = (page - 1) * perPage;
        const end = start + perPage;

        const fragment = document.createDocumentFragment();
        reviews.slice(start, end).forEach(r => {
            fragment.appendChild(createReviewCard(r, 'page'));
        });

        container.innerHTML = '';
        container.appendChild(fragment);

        updateTranslations();
        attachReviewActions(container);
        translateReviews(container);
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

// ====================== TRADUCIR RESEÑAS ======================

async function translateReviews(container) {
    if (!container) return;
    const lang = getCurrentLanguage();

    const elements = container.querySelectorAll('.review-title, .review-text');
    await Promise.all(Array.from(elements).map(async el => {
        const originalText = el.dataset.original;
        const originalLang = el.dataset.lang || 'es';
        if (lang === originalLang) {
            el.textContent = originalText; // idioma coincide → mostrar original
        } else {
            el.textContent = await traducirTexto(originalText, lang.startsWith('en') ? 'en' : 'es');
        }
    }));
}

// ====================== CARGAR RESEÑAS DEL USUARIO ======================

export async function loadUserReviews(token) {
    const containerRecientes = document.getElementById("user-reviews");
    const containerOnly = document.getElementById("tab-only-reviews");
    const reviewsCount = document.getElementById("profile-reviews");

    if (!containerRecientes && !containerOnly) return;

    try {
        const resp = await fetch(`${API_BASE_URL}/Review/GetReviewsByUser.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        });

        if (!resp.ok) throw new Error(translate("errorLoadingReviews"));
        const data = await resp.json();
        let reviews = data.reviews || [];

        reviewsCount && (reviewsCount.textContent = reviews.length);

        if (!reviews.length) {
            const emptyHtml = `<div class="empty-state"><p data-translate="noReviews">No has escrito ninguna reseña</p></div>`;
            containerRecientes && (containerRecientes.innerHTML = emptyHtml);
            containerOnly && (containerOnly.innerHTML = emptyHtml);
            updateTranslations();
            return;
        }

        // Obtener detalles de películas y posters
        reviews = await Promise.all(reviews.map(async r => {
            const movieId = r.id_pelicula || r.movie_id || r.pelicula_id;
            if (!movieId) return { ...r, poster_path: null, images: null, nombre_pelicula: "Película desconocida" };
            try {
                const movie = await fetchFromApi.movieDetails(movieId);
                return {
                    ...r,
                    poster_path: movie.poster_path || null,
                    images: movie.images || null,
                    nombre_pelicula: movie.title || "Película desconocida"
                };
            } catch {
                return { ...r, poster_path: null, images: null, nombre_pelicula: "Película desconocida" };
            }
        }));

        cachedReviews = reviews; // guardar en cache

        // Carousel
        if (containerRecientes) {
            const fragment = document.createDocumentFragment();
            reviews.slice(0, MAX_RECENTES).forEach(r => fragment.appendChild(createReviewCard(r, 'carousel')));
            containerRecientes.innerHTML = '';
            containerRecientes.appendChild(fragment);
            updateTranslations();
            translateReviews(containerRecientes);
        }

        // Página vertical
        if (containerOnly) {
            renderPaginatedReviewsVertical(containerOnly, reviews, MAX_RESEÑAS_SOLO);
        }

    } catch (err) {
        console.error(err);
        showError(translate("errorLoadingReviews"), "error");
        reviewsCount && (reviewsCount.textContent = 0);
    }
}

// ====================== ACCIONES EDITAR / ELIMINAR ======================

function attachReviewActions(container) {
    container.querySelectorAll('.review-card').forEach(card => {
        const actions = card.querySelector('.review-actions');
        if (!actions) return;

        const icon = actions.querySelector('.actions-icon');
        const deleteBtn = actions.querySelector('.delete-review-btn');
        const editBtn = actions.querySelector('.edit-review-btn');

        icon.addEventListener('click', () => actions.classList.toggle('show'));

        deleteBtn.addEventListener('click', async () => {
            const movieId = card.dataset.movieId;
            const res = await deleteReview(movieId);
            if (res.success) {
                card.remove();
                showError("reviewDeleted", "success");
            } else {
                showError("errorDeletingReview", "error");
            }
        });

        editBtn.addEventListener('click', () => {
            const movieId = card.dataset.movieId;
            window.open(`/entrada.html?id=${movieId}&editReview=1`, '_blank');
        });
    });
}

// ====================== ACTUALIZAR POSTERS Y TRADUCCIONES AL CAMBIAR IDIOMA ======================

function updateReviewPosters() {
    if (!cachedReviews.length) return;

    const containerRecientes = document.getElementById("user-reviews");
    const containerOnly = document.getElementById("tab-only-reviews");

    if (containerRecientes) {
        const fragment = document.createDocumentFragment();
        cachedReviews.slice(0, MAX_RECENTES).forEach(r => fragment.appendChild(createReviewCard(r, 'carousel')));
        containerRecientes.innerHTML = '';
        containerRecientes.appendChild(fragment);
        translateReviews(containerRecientes);
        updateTranslations();
    }

    if (containerOnly) {
        renderPaginatedReviewsVertical(containerOnly, cachedReviews, MAX_RESEÑAS_SOLO);
    }
}

// ====================== EVENTOS ======================

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await loadUserReviews(token);
});

document.addEventListener('languageChanged', () => {
    updateTranslations();
    updateReviewPosters();
});
