import { addFavorito } from "../../api/endpoints/AddFavorito.js";
import { checkFavorito } from "../../api/endpoints/CheckFavorito.js";
import { deleteFavorito } from "../../api/endpoints/DeleteFavorito.js";

const favoriteBtn = document.getElementById("favorite-btn");
const favoriteCheckbox = favoriteBtn?.querySelector("input");

export async function setupFavoriteButton(movieId, movieData) {
  if (!favoriteBtn || !favoriteCheckbox) return; // Evita errores si no existe el botón o el input

  // 1️⃣ Verificar si ya está en favoritos
  try {
    const checkData = await checkFavorito(movieId);
    if (checkData.success && checkData.es_favorito) {
      favoriteCheckbox.checked = true;
    }
  } catch (error) {
    console.error("Error al verificar favorito:", error);
  }

  // 2️⃣ Click en el botón
  favoriteBtn.addEventListener("click", async () => {
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
        favoriteCheckbox.checked = !isFavorited; // activa/desactiva animación y color
        // Opcional: mostrar mensaje al usuario
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
