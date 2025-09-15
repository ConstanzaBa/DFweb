import { fetchConToken } from '../../utils/AuthFetch.js';

export async function updateReview(pelicula_id, { review, puntuacion, titulo = "" }) {
  try {
    const response = await fetchConToken('/Review/UpdateReview.php', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pelicula_id, review, puntuacion, titulo })
    });

    const data = await response.json();
    return data; // { success: true/false, message/error }
  } catch (err) {
    console.error("Error en updateReview:", err);
    return { success: false, error: err.message };
  }
}
