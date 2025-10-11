import { getReviewsByPelicula } from '../../api/endpoints/GetReviewsByPelicula.js';
import { addReview } from '../../api/endpoints/AddReview.js';
import { updateReview } from '../../api/endpoints/updateReview.js';
import { getReviewByUserAndMovie } from '../../api/endpoints/GetReviewByUserAndMovie.js';
import { API_BASE_URL } from '../../utils/config.js';
import { fetchConToken } from '../../utils/AuthFetch.js';
import { showError } from "../user/ShowError.js";
import { translate, getCurrentLanguage } from '../../utils/i18n.js';

// ===================== CACHE DE TRADUCCIONES =====================
const translationCache = new Map();

// ===================== FUNCIONES AUXILIARES =====================
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

async function obtenerUserData(usuario_id) {
    try {
        const resp = await fetchConToken(`${API_BASE_URL}/Usuarios/GetUserPublic.php?usuario_id=${usuario_id}`);
        const text = await resp.text();
        const userData = text ? JSON.parse(text) : {};
        let avatarUrl = userData.avatar || "assets/avatars/default-avatar.png";
        if (!avatarUrl.startsWith("http")) {
            if (!avatarUrl.startsWith("uploads/") && !avatarUrl.startsWith("assets/")) {
                avatarUrl = `assets/avatars/${avatarUrl}`;
            }
            avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
        }
        return { ...userData, avatarUrl };
    } catch {
        return { usuario: "Usuario", avatarUrl: "assets/avatars/default-avatar.png" };
    }
}

// ===================== CREAR HTML DE RESEÑAS =====================
async function crearComentariosFragment(reviews, lang) {
    const fragment = document.createDocumentFragment();
    const usersData = await Promise.all(reviews.map(r => obtenerUserData(r.usuario_id)));

    await Promise.all(reviews.map(async (review, index) => {
        let titulo = review.titulo || "";
        let texto = review.review || "";

        // Solo traducir si el idioma actual es diferente del original
        if (lang.startsWith('en') && !review.language?.startsWith('en')) {
            titulo = await traducirTexto(titulo, 'en');
            texto = await traducirTexto(texto, 'en');
        } else if (lang.startsWith('es') && !review.language?.startsWith('es')) {
            titulo = await traducirTexto(titulo, 'es');
            texto = await traducirTexto(texto, 'es');
        }

        const userData = usersData[index];
        const score = parseInt(review.puntuacion, 10);

        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
            <div class="comment-header">
                <img src="${userData.avatarUrl}" alt="${userData.usuario}" class="comment-avatar" />
                <strong>${userData.usuario}</strong>
                <div class="rating-comment">
                    ${"★".repeat(score)}${"☆".repeat(5 - score)}
                </div>
            </div>
            <div class="comment-title">${titulo}</div>
            <p class="comment-text">${texto}</p>
        `;
        fragment.appendChild(div);
    }));

    return fragment;
}

// ===================== RENDER RESEÑAS =====================
export async function renderReviews(pelicula_id) {
    const commentsContainer = document.getElementById("comments-container");
    const averageNumberSpan = document.querySelector(".average-number");
    const averageStarsDiv = document.querySelector(".average-stars");
    const totalReviewsSpan = document.querySelector(".total-reviews");
    if (!commentsContainer) return;

    const lang = getCurrentLanguage();
    commentsContainer.innerHTML = `<p>${translate('loadingReviews')}</p>`;

    try {
        const data = await getReviewsByPelicula(pelicula_id);

        if (!data.success || !data.reviews.length) {
            commentsContainer.innerHTML = `<p>${translate('noReviewsYet')}</p>`;
            if (averageNumberSpan) averageNumberSpan.textContent = "0.0";
            if (averageStarsDiv) averageStarsDiv.innerHTML = "☆☆☆☆☆";
            if (totalReviewsSpan) totalReviewsSpan.textContent = `0 ${translate('ratings')}`;
            document.querySelectorAll(".rating-row").forEach(row => {
                row.querySelector(".bar").style.width = "0%";
                row.querySelector(".count").textContent = "0";
            });
            return;
        }

        commentsContainer.innerHTML = "";
        const fragment = await crearComentariosFragment(data.reviews, lang);
        commentsContainer.appendChild(fragment);

        // Estadísticas
        let sumRatings = 0;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.reviews.forEach(r => {
            const score = parseInt(r.puntuacion, 10);
            sumRatings += score;
            counts[score]++;
        });

        const avgRating = (sumRatings / data.reviews.length).toFixed(1);
        if (averageNumberSpan) averageNumberSpan.textContent = avgRating;
        if (averageStarsDiv) averageStarsDiv.innerHTML =
            `${"★".repeat(Math.round(avgRating))}${"☆".repeat(5 - Math.round(avgRating))}`;
        if (totalReviewsSpan) totalReviewsSpan.textContent = `${data.reviews.length} ${translate('ratings')}`;

        const maxCount = Math.max(...Object.values(counts));
        Object.keys(counts).forEach(star => {
            const row = document.querySelector(`.rating-row[data-star="${star}"]`);
            if (row) {
                const bar = row.querySelector(".bar");
                const countSpan = row.querySelector(".count");
                const percent = maxCount > 0 ? (counts[star] / maxCount) * 100 : 0;
                bar.style.width = percent + "%";
                countSpan.textContent = counts[star];
            }
        });

    } catch (err) {
        showError(translate('reviewLoadError'), 'error');
    }
}

// ===================== FORMULARIO DE RESEÑAS =====================
export function setupReviewForm(pelicula_id) {
    const actualizarFormulario = async () => {
        const formWrapper = document.querySelector('.text-box');
        if (!formWrapper) return;

        const token = localStorage.getItem('token');
        const lang = getCurrentLanguage();

        if (!token) {
            formWrapper.innerHTML = `<p class="login-warning">${translate('loginMessage')}</p>`;
            return;
        }

        let userReview = null;
        const params = new URLSearchParams(window.location.search);
        const isEditMode = params.get("editReview") === "1";

        try {
            const reviewData = await getReviewByUserAndMovie(pelicula_id);
            if (reviewData.success && reviewData.review) {
                userReview = reviewData.review;
                if (!isEditMode) {
                    formWrapper.innerHTML = `<p class="login-warning">${translate('alreadyReviewed')}</p>`;
                    return;
                }
            }
        } catch {
            showError(translate('reviewCheckError'), 'error');
            return;
        }

        formWrapper.innerHTML = `
            <div class="input-wrapper">
                <input type="text" id="review-title" placeholder="${translate('reviewTitle')}" value="${userReview?.titulo || ''}" />
                <textarea id="review-text" placeholder="${translate('reviewText')}">${userReview?.review || ''}</textarea>
                <div class="rating-form">
                    ${[5,4,3,2,1].map(n => `
                        <input type="radio" name="rating" id="star${n}" value="${n}" ${userReview?.puntuacion === n ? 'checked' : ''}>
                        <label for="star${n}"></label>
                    `).join('')}
                </div>
                <button class="send" id="send-review">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                    </svg>
                </button>
            </div>
        `;

        const sendBtn = document.getElementById('send-review');
        sendBtn.onclick = async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('review-title')?.value.trim();
            const review = document.getElementById('review-text')?.value.trim();
            const puntuacionInput = document.querySelector('input[name="rating"]:checked');
            const puntuacion = puntuacionInput ? parseInt(puntuacionInput.value, 10) : null;

            if (!review || !puntuacion) {
                showError(translate("reviewCommentRequired"), "warning");
                return;
            }

            try {
                let result;
                if (userReview) {
                    result = await updateReview(pelicula_id, { titulo, review, puntuacion });
                } else {
                    result = await addReview(pelicula_id, review, puntuacion, titulo);
                }

                if (result.success) {
                    showError(userReview ? translate("reviewUpdated") : translate("reviewAdded"), "success");
                    await renderReviews(pelicula_id);

                    if (userReview) {
                        window.location.href = `entrada.html?id=${pelicula_id}`;
                        return;
                    }

                    formWrapper.innerHTML = `<p class="login-warning">${translate('alreadyReviewed')}</p>`;
                } else {
                    showError(result.error || result.message || translate("reviewProcessError"), "error");
                }
            } catch (err) {
                showError(`${translate("reviewUnexpectedError")} ${err.message}`, "error");
            }
        };
    };

    window.onload = actualizarFormulario;
    document.addEventListener('languageChanged', actualizarFormulario);
    document.addEventListener('languageChanged', async () => await renderReviews(pelicula_id));
}
