// favoriteButton.js
import { addFavorito } from "../../api/endpoints/AddFavorito.js";
import { checkFavorito } from "../../api/endpoints/CheckFavorito.js";
import { deleteFavorito } from "../../api/endpoints/DeleteFavorito.js";
import { showError } from "../user/ShowError.js"; 

export async function setupFavoriteButton(movieId, movieData) {
  const favoriteBtn = document.getElementById("favorite-btn");
  const favoriteCheckbox = favoriteBtn?.querySelector("input");
  if (!favoriteBtn || !favoriteCheckbox) return;

  const token = localStorage.getItem("token");
  let esFavorito = false;

  if (token) {
    try {
      const checkData = await checkFavorito(movieId);
      esFavorito = checkData.success && checkData.es_favorito;
      favoriteCheckbox.checked = esFavorito;
    } catch (error) {
      console.error("Error al verificar favorito:", error);
      showError("Error al verificar favorito", "error");
    }
  } else {
    favoriteCheckbox.checked = false;
  }

  favoriteBtn.addEventListener("click", async () => {
    if (!token) {
      showError("Debes iniciar sesión para usar favoritos", "warning");
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
        showError(result.message || "Estado actualizado", "success");
      } else {
        showError(result.error || "Error al actualizar favorito", "error");
      }
    } catch (error) {
      console.error("Error en favoritos:", error);
      showError("Error en el servidor", "error");
    }
  });
}
