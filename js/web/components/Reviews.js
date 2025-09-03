import { getReviewsByPelicula } from '../../api/endpoints/GetReviewsByPelicula.js';
import { addReview } from '../../api/endpoints/AddReview.js';
import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';

// Renderiza las reseñas de la película
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
            averageNumberSpan.textContent = "0.0";
            averageStarsDiv.innerHTML = "☆☆☆☆☆";
            totalReviewsSpan.textContent = "0 calificaciones";

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

            // Obtener info del usuario sin token (visible para todos)
            const userResponse = await fetch(
    `${API_BASE_URL}/Usuarios/GetUserPublic.php?usuario_id=${review.usuario_id}`
);

            const userData = await userResponse.json();

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
                    <img src="${avatarUrl}" alt="${userData.usuario}" class="comment-avatar" />
                    <strong>${userData.usuario}</strong>
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
        averageNumberSpan.textContent = avgRating;
        averageStarsDiv.innerHTML = `${"★".repeat(Math.round(avgRating))}${"☆".repeat(5 - Math.round(avgRating))}`;
        totalReviewsSpan.textContent = `${data.reviews.length} calificaciones`;

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
        commentsContainer.innerHTML = "<p>Error al cargar reseñas.</p>";
    }
}

// Función para configurar el formulario de reseñas (solo para usuarios logueados)
export function setupReviewForm(pelicula_id) {
    window.onload = () => {
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

        if (!sendBtn) return;

        sendBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const titulo = document.getElementById('review-title')?.value.trim();
            const review = document.getElementById('review-text')?.value.trim();
            const puntuacionInput = document.querySelector('input[name="rating"]:checked');
            const puntuacion = puntuacionInput ? parseInt(puntuacionInput.value, 10) : null;

            if (!review || !puntuacion) {
                alert("Debes escribir un comentario y seleccionar una puntuación");
                return;
            }

            try {
                const result = await addReview(pelicula_id, review, puntuacion, titulo);
                if (result.success) {
                    alert("Reseña agregada correctamente");
                    document.getElementById('review-title').value = '';
                    document.getElementById('review-text').value = '';
                    if (puntuacionInput) puntuacionInput.checked = false;
                    await renderReviews(pelicula_id);
                } else {
                    alert("Error al agregar reseña: " + (result.error || result.message || "Error desconocido"));
                }
            } catch (err) {
                console.error("Error al enviar la review:", err);
                alert("Hubo un error al enviar la reseña: " + err.message);
            }
        });
    };
}
