import { API_BASE_URL } from '../../utils/config.js';

export async function checkFavorito(movieId) {
  try {
    const token = localStorage.getItem("token"); // tu JWT guardado
    if (!token) throw new Error("Token no encontrado en localStorage");

    const response = await fetch(
      `${API_BASE_URL}/Favoritos/CheckFavorito.php?pelicula_id=${movieId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // <--- JWT obligatorio
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Error HTTP en checkFavorito:", response.status, text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error en checkFavorito:", error);
    return { success: false, error: error.message };
  }
}
