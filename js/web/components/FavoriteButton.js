import { addFavorito } from "../../api/endpoints/AddFavorito.js";
import { checkFavorito } from "../../api/endpoints/CheckFavorito.js";
import { deleteFavorito } from "../../api/endpoints/DeleteFavorito.js";

const favoriteBtn = document.getElementById("favorite-btn");
const favoriteCheckbox = favoriteBtn?.querySelector("input");

export async function setupFavoriteButton(movieId, movieData) {
  if (!favoriteBtn || !favoriteCheckbox) return;

  const token = localStorage.getItem("token");

  // 1️⃣ Solo verificar favorito si hay usuario logueado
  let esFavorito = false;
  if (token) {
    try {
      const checkData = await checkFavorito(movieId);
      esFavorito = checkData.success && checkData.es_favorito;
      favoriteCheckbox.checked = esFavorito;
    } catch (error) {
      console.error("Error al verificar favorito:", error);
    }
  } else {
    // Si no hay token, deshabilitar el botón o dejar sin marcar
    favoriteCheckbox.checked = false;
  }

  // 2️⃣ Click en el botón
  favoriteBtn.addEventListener("click", async () => {
    if (!token) {
      alert("Debes iniciar sesión para usar favoritos");
      return;
    }

    const isFavorited = favoriteCheckbox.checked;

    try {
      let result;
      if (isFavorited) {
        result = await deleteFavorito(movieId);
      } else {
        result = await addFavorito({
          pelicula_id: movieId,
          titulo: movieData.title,
          genero: movieData.genre_ids?.join(",") || "",
          duracion: movieData.runtime || 0,
          calificacion: movieData.vote_average || 0,
          poster_url: movieData.poster_path || ""
        });
      }

      if (result.success) {
        favoriteCheckbox.checked = !isFavorited;
        alert(result.message || "Estado actualizado");
      } else {
        alert(result.error || "Error al actualizar favorito");
      }
    } catch (error) {
      console.error("Error en favoritos:", error);
      alert("Error en el servidor.");
    }
  });
}
