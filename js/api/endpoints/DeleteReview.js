import { fetchConToken } from '../../utils/AuthFetch.js';

export async function deleteReview(pelicula_id) {
  try {
    const response = await fetchConToken('/Review/DeleteReview.php', {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pelicula_id })
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error en deleteReview:", err);
    return { success: false, error: err.message };
  }
}
