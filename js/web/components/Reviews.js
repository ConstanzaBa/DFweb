import { getReviewsByPelicula } from '../../api/endpoints/GetReviewsByPelicula.js';
import { addReview } from '../../api/endpoints/AddReview.js';
import { updateReview } from '../../api/endpoints/updateReview.js';
import { checkReview } from '../../api/endpoints/CheckReview.js';
import { getReviewByUserAndMovie } from '../../api/endpoints/GetReviewByUserAndMovie.js';
import { API_BASE_URL } from '../../utils/config.js';
import { fetchConToken } from '../../utils/AuthFetch.js';
import { showError } from "../user/ShowError.js";

// ===================== RENDER RESEÑAS =====================
export async function renderReviews(pelicula_id) {
    const commentsContainer = document.getElementById("comments-container");
    const averageNumberSpan = document.querySelector(".average-number");
    const averageStarsDiv = document.querySelector(".average-stars");
    const totalReviewsSpan = document.querySelector(".total-reviews");
    if (!commentsContainer) return;

    commentsContainer.innerHTML = "<p>Cargando reseñas...</p>";

    try {
        const data = await getReviewsByPelicula(pelicula_id);

        if (!data.success || !data.reviews.length) {
            commentsContainer.innerHTML = "<p>No hay reseñas aún.</p>";
            if (averageNumberSpan) averageNumberSpan.textContent = "0.0";
            if (averageStarsDiv) averageStarsDiv.innerHTML = "☆☆☆☆☆";
            if (totalReviewsSpan) totalReviewsSpan.textContent = "0 calificaciones";

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
            const score = parseInt(review.puntuacion, 10);
            sumRatings += score;
            counts[score]++;

            // Usamos fetchConToken para mayor seguridad
            let userData = {};
            try {
                const userResp = await fetchConToken(`${API_BASE_URL}/Usuarios/GetUserPublic.php?usuario_id=${review.usuario_id}`);
                const text = await userResp.text();
                userData = text ? JSON.parse(text) : {};
            } catch {
                userData = {};
            }

            let avatarUrl = userData.avatar || "assets/avatars/default-avatar.png";
            if (!avatarUrl.startsWith("http")) {
                if (!avatarUrl.startsWith("uploads/") && !avatarUrl.startsWith("assets/")) {
                    avatarUrl = `assets/avatars/${avatarUrl}`;
                }
                avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
            }

            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.innerHTML = `
                <div class="comment-header">
                    <img src="${avatarUrl}" alt="${userData.usuario || 'Usuario'}" class="comment-avatar" />
                    <strong>${userData.usuario || 'Usuario'}</strong>
                    <div class="rating-comment">
                        ${"★".repeat(score)}${"☆".repeat(5 - score)}
                    </div>
                </div>
                <div class="comment-title">${review.titulo || ""}</div>
                <p class="comment-text">${review.review}</p>
            `;
            commentsContainer.appendChild(commentDiv);
        }

        const avgRating = (sumRatings / data.reviews.length).toFixed(1);
        if (averageNumberSpan) averageNumberSpan.textContent = avgRating;
        if (averageStarsDiv) averageStarsDiv.innerHTML =
            `${"★".repeat(Math.round(avgRating))}${"☆".repeat(5 - Math.round(avgRating))}`;
        if (totalReviewsSpan) totalReviewsSpan.textContent = `${data.reviews.length} calificaciones`;

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

    } catch (error) {
        console.error("Error al cargar reseñas:", error);
        showError("Error al cargar reseñas", "error");
    }
}

// ===================== FORMULARIO DE RESEÑAS =====================
export function setupReviewForm(pelicula_id) {
    window.onload = async () => {
        const formWrapper = document.querySelector('.text-box');
        const sendBtn = document.getElementById('send-review');
        if (!formWrapper) return;

        const token = localStorage.getItem('token');
        if (!token) {
            formWrapper.innerHTML = `
                <p class="login-warning">
                    Debes <a href="./login.html">iniciar sesión</a> para dejar una reseña.
                </p>
            `;
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const isEditMode = params.get("editReview") === "1";

        let userReview = null;

        try {
            const reviewData = await getReviewByUserAndMovie(pelicula_id);
            if (reviewData.success && reviewData.review) {
                userReview = reviewData.review;

                if (!isEditMode) {
                    formWrapper.innerHTML = `
                        <p class="login-warning">
                            Ya dejaste una reseña en esta película.
                        </p>
                    `;
                    return;
                }

                // Modo edición → rellenamos campos sin cambiar el icono del botón
                document.getElementById('review-title').value = userReview.titulo || '';
                document.getElementById('review-text').value = userReview.review || '';
                if (userReview.puntuacion) {
                    const starInput = document.getElementById(`star${userReview.puntuacion}`);
                    if (starInput) starInput.checked = true;
                }
                // NO cambiamos sendBtn.textContent para mantener icono
            }
        } catch (err) {
            console.error("Error al verificar reseña existente:", err);
            showError("Error al verificar reseña existente", "error");
            return;
        }

        if (!sendBtn) return;

        sendBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const titulo = document.getElementById('review-title')?.value.trim();
            const review = document.getElementById('review-text')?.value.trim();
            const puntuacionInput = document.querySelector('input[name="rating"]:checked');
            const puntuacion = puntuacionInput ? parseInt(puntuacionInput.value, 10) : null;

            if (!review || !puntuacion) {
                showError("Debes escribir un comentario y seleccionar una puntuación", "warning");
                return;
            }

            try {
                let result;
                if (userReview && isEditMode) {
                    result = await updateReview(pelicula_id, { titulo, review, puntuacion });
                } else {
                    result = await addReview(pelicula_id, review, puntuacion, titulo);
                }

                if (result.success) {
                    showError(
                        userReview && isEditMode
                            ? "Reseña actualizada correctamente"
                            : "Reseña agregada correctamente",
                        "success"
                    );
                    await renderReviews(pelicula_id);
                } else {
                    showError(result.error || result.message || "Error al procesar reseña", "error");
                }
            } catch (err) {
                console.error("Error al procesar reseña:", err);
                showError("Hubo un error al procesar la reseña: " + err.message, "error");
            }
        });
    };
}
