import { API_BASE_URL } from '../../utils/config.js';

export async function addFavorito(movieData) {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token no encontrado en localStorage");

    const response = await fetch(`${API_BASE_URL}/Favoritos/AddFavorito.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(movieData),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error HTTP en addFavorito:", response.status, text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error en addFavorito:", error);
    return { success: false, error: error.message };
  }
}
