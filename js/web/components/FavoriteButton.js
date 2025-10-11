// /web/components/FavoriteButton.js
import { addFavorito } from "../../api/endpoints/AddFavorito.js";
import { checkFavorito } from "../../api/endpoints/CheckFavorito.js";
import { deleteFavorito } from "../../api/endpoints/DeleteFavorito.js";
import { showError } from "../user/ShowError.js";
import { translate } from "../../utils/i18n.js";

export async function setupFavoriteButton(movieId, movieData) {
  const favoriteBtn = document.getElementById("favorite-btn");
  const favoriteCheckbox = favoriteBtn?.querySelector("input");
  if (!favoriteBtn || !favoriteCheckbox) return;

  const token = localStorage.getItem("token");
  let esFavorito = false;

  // ====================== VERIFICAR ESTADO INICIAL ======================
  if (token) {
    try {
      const checkData = await checkFavorito(movieId);
      esFavorito = checkData.success && checkData.es_favorito;
      favoriteCheckbox.checked = esFavorito;
    } catch (error) {
      console.error("Error al verificar favorito:", error);
      showError("favoriteCheckError", "error");
    }
  } else {
    favoriteCheckbox.checked = false;
  }

  // ====================== CLICK FAVORITO ======================
  favoriteBtn.addEventListener("click", async () => {
    if (!token) {
      showError("loginToAddFavorites", "error");
      return;
    }

    const isFavorited = favoriteCheckbox.checked;

    try {
      let result;
      if (isFavorited) {
        // Eliminar de favoritos
        result = await deleteFavorito(movieId);
      } else {
        // Agregar a favoritos
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

        // Mensaje traducido según acción
        if (isFavorited) {
          showError("removedFromFavorites", "success");
        } else {
          showError("addedToFavorites", "success");
        }

      } else {
        console.warn("Error en la respuesta del servidor:", result);
        showError("favoriteUpdateError", "error");
      }

    } catch (error) {
      console.error("Error en favoritos:", error);
      showError("serverError", "error");
    }
  });
}
