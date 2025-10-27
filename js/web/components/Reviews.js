import { getReviewsByPelicula } from '../../api/endpoints/GetReviewsByPelicula.js';
import { addReview } from '../../api/endpoints/AddReview.js';
import { updateReview } from '../../api/endpoints/updateReview.js';
import { getReviewByUserAndMovie } from '../../api/endpoints/GetReviewByUserAndMovie.js';
import { API_BASE_URL } from '../../utils/config.js';
import { fetchConToken } from '../../utils/AuthFetch.js';
import { showError } from "../user/ShowError.js";
import { translate, getCurrentLanguage } from '../../utils/i18n.js';

// ===================== MEMORIA DE RESEÑAS =====================
let reseñasCache = [];

// ===================== FUNCIÓN DE TRADUCCIÓN =====================
async function traducirTexto(texto, idiomaDestino = "en") {
    if (!texto || texto.trim() === "") return texto;
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|${idiomaDestino}`
        );
        const data = await response.json();
        return data?.responseData?.translatedText || texto;
    } catch (err) {
        console.warn("Error al traducir texto:", err);
        return texto;
    }
}

// ===================== OBTENER DATOS DE USUARIO =====================
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

// ===================== CREAR HTML DE CADA COMENTARIO =====================
async function crearComentarioHTML(review, lang) {
    const userData = await obtenerUserData(review.usuario_id);

    let titulo = review.titulo || "";
    let texto = review.review || "";

    if (lang.startsWith('en')) {
        titulo = await traducirTexto(titulo, 'en');
        texto = await traducirTexto(texto, 'en');
    }

    const score = parseInt(review.puntuacion, 10);

    return `
        <div class="comment">
            <div class="comment-header">
                <img src="${userData.avatarUrl}" alt="${userData.usuario}" class="comment-avatar" />
                <strong>${userData.usuario}</strong>
                <div class="rating-comment">
                    ${"★".repeat(score)}${"☆".repeat(5 - score)}
                </div>
            </div>
            <div class="comment-title">${titulo}</div>
            <p class="comment-text">${texto}</p>
        </div>
    `;
}

// ===================== RENDER RESEÑAS =====================
export async function renderReviews(pelicula_id, forceReload = true) {
    const commentsContainer = document.getElementById("comments-container");
    const averageNumberSpan = document.querySelector(".average-number");
    const averageStarsDiv = document.querySelector(".average-stars");
    const totalReviewsSpan = document.querySelector(".total-reviews");
    if (!commentsContainer) return;

    const lang = getCurrentLanguage();
    commentsContainer.innerHTML = `<p>${translate('loadingReviews')}</p>`;

    try {
        let data;
        if (forceReload) {
            data = await getReviewsByPelicula(pelicula_id);
            if (data.success) reseñasCache = data.reviews;
        } else {
            data = { success: true, reviews: reseñasCache };
        }

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
        let sumRatings = 0;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        for (const review of data.reviews) {
            const html = await crearComentarioHTML(review, lang);
            commentsContainer.insertAdjacentHTML('beforeend', html);
            const score = parseInt(review.puntuacion, 10);
            sumRatings += score;
            counts[score]++;
        }

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
        console.error(err);
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
            formWrapper.innerHTML = `
                <p class="login-warning">
                    ${lang === 'en-US' ? `You must <a href="./login.html">${translate('login')}</a> to write a review`
                        : `Debes <a href="./login.html">${translate('login')}</a> para dejar una reseña`}
                </p>`;
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
                    formWrapper.innerHTML = `
                        <p class="login-warning">
                            ${translate('alreadyReviewed')}
                        </p>`;
                    return;
                }
            }
        } catch (err) {
            console.error(err);
            showError(translate('reviewCheckError'), 'error');
            return;
        }

        // ===================== CREAR FORMULARIO =====================
        formWrapper.innerHTML = `
            <div class="input-wrapper">
                <input type="text" id="review-title" placeholder="${translate('reviewTitle') || 'Título'}" value="${userReview?.titulo || ''}" />
                <textarea id="review-text" placeholder="${translate('reviewText') || 'Escribe tu reseña...'}">${userReview?.review || ''}</textarea>
                <div class="rating-form">
                    <input type="radio" name="rating" id="star5" value="5" ${userReview?.puntuacion === 5 ? 'checked' : ''}><label for="star5"></label>
                    <input type="radio" name="rating" id="star4" value="4" ${userReview?.puntuacion === 4 ? 'checked' : ''}><label for="star4"></label>
                    <input type="radio" name="rating" id="star3" value="3" ${userReview?.puntuacion === 3 ? 'checked' : ''}><label for="star3"></label>
                    <input type="radio" name="rating" id="star2" value="2" ${userReview?.puntuacion === 2 ? 'checked' : ''}><label for="star2"></label>
                    <input type="radio" name="rating" id="star1" value="1" ${userReview?.puntuacion === 1 ? 'checked' : ''}><label for="star1"></label>
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
                let tituloTrad = titulo;
                let reviewTrad = review;
                if (lang.startsWith('en')) {
                    tituloTrad = await traducirTexto(titulo, 'en');
                    reviewTrad = await traducirTexto(review, 'en');
                }

                let result;
                if (userReview) {
                    result = await updateReview(pelicula_id, { titulo: tituloTrad, review: reviewTrad, puntuacion });
                } else {
                    result = await addReview(pelicula_id, reviewTrad, puntuacion, tituloTrad);
                }

                if (result.success) {
                    showError(userReview ? translate("reviewUpdated") : translate("reviewAdded"), "success");
                    await renderReviews(pelicula_id);

                    if (userReview) {
                        // Redirige a la página de entrada después de actualizar
                        window.location.href = `entrada.html?id=${pelicula_id}`;
                        return;
                    }

                    // Para nueva reseña: reemplaza formulario con mensaje
                    formWrapper.innerHTML = `<p class="login-warning">${translate('alreadyReviewed')}</p>`;
                } else {
                    showError(result.error || result.message || translate("reviewProcessError"), "error");
                }
            } catch (err) {
                console.error(err);
                showError(`${translate("reviewUnexpectedError")} ${err.message}`, "error");
            }
        };
    };

    window.onload = actualizarFormulario;
    document.addEventListener('languageChanged', actualizarFormulario);
    document.addEventListener('languageChanged', async () => await renderReviews(pelicula_id, false));
}


