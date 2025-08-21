import { API_BASE_URL } from '../../utils/config.js';

export async function getFavoritosByUser() {
  try {
    const token = localStorage.getItem("token"); // tu JWT guardado
    if (!token) throw new Error("Token no encontrado en localStorage");

    const response = await fetch(`${API_BASE_URL}/Favoritos/GetFavoritoByUser.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // <--- JWT obligatorio
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error HTTP en getFavoritosByUser:", response.status, text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error en getFavoritosByUser:", error);
    return { success: false, error: error.message };
  }
}
