import { API_BASE_URL } from '../../utils/config.js';

export async function addReview(pelicula_id, review, puntuacion, titulo) {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token no encontrado en localStorage");

    const response = await fetch(`${API_BASE_URL}/Review/AddReview.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ pelicula_id, review, puntuacion, titulo }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Respuesta no JSON de AddReview.php:", text);
      return { success: false, error: "Respuesta no JSON del servidor" };
    }

    return data;

  } catch (error) {
    console.error("Error en addReview:", error);
    return { success: false, error: error.message };
  }
}
