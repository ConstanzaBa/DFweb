import { fetchConToken } from '../../utils/AuthFetch.js';

export async function getReviewsByUser() {
  try {
    const response = await fetchConToken('/Review/GetReviewsByUser.php', {
      method: "GET"
    });

    const data = await response.json();
    return data; // { success: true, reviews: [...] }
  } catch (err) {
    console.error("Error en getReviewsByUser:", err);
    return { success: false, error: err.message };
  }
}
