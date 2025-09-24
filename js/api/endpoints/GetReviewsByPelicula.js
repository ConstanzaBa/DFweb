import { API_BASE_URL } from '../../utils/config.js';

export async function getReviewsByPelicula(pelicula_id) {
  try {
    const response = await fetch(`${API_BASE_URL}/Review/GetReviewsByPelicula.php?pelicula_id=${pelicula_id}`, {
      method: "GET",
      credentials: 'include' // si usas cookies, opcional
    });

    const data = await response.json();
    return data; // { success: true, reviews: [...] }
  } catch (err) {
    console.error("Error en getReviewsByPelicula:", err);
    return { success: false, reviews: [], error: err.message };
  }
}
