import { fetchConToken } from '../../utils/AuthFetch.js';

export async function checkReview(pelicula_id) {
  try {
    const response = await fetchConToken(`/Review/CheckReview.php?pelicula_id=${pelicula_id}`, {
      method: "GET"
    });

    const data = await response.json();
    return data; // { success: true, exists: true/false }
  } catch (err) {
    console.error("Error en checkReview:", err);
    return { success: false, error: err.message };
  }
}
