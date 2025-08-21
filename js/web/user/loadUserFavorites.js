import { TMDB_imgBaseUrl } from "../../utils/consts.js";
import { fetchConToken } from "../../utils/AuthFetch.js"; // usamos fetchConToken
import { API_BASE_URL } from "../../utils/config.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserFavorites();
});

export async function loadUserFavorites() {
  const container = document.getElementById("fav-movies");
  if (!container) return;

  try {
    // Hacemos la llamada al endpoint de favoritos usando fetchConToken
    const response = await fetchConToken('/Favoritos/GetFavoritoByUser.php', {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Error al obtener favoritos");

    const data = await response.json();
    const favoritos = data.favorites || []; // <- aquí usamos la propiedad correcta

    if (!favoritos.length) {
      container.innerHTML = `<div class="empty-state"><p>No tienes películas favoritas</p></div>`;
      return;
    }

    container.innerHTML = favoritos.map(createFavoriteCard).join("");

    // Actualizar contador de favoritos en el perfil
    const favoritesCount = document.getElementById("profile-favorites");
    if (favoritesCount) favoritesCount.textContent = favoritos.length;

  } catch (error) {
    console.error("Error cargando favoritos:", error);
    container.innerHTML = `
      <div class="error-state">
        <p>Error al cargar tus favoritos</p>
        <p>Por favor, intenta de nuevo más tarde</p>
      </div>
    `;
  }
}

function createFavoriteCard(movie) {
  const posterPath = movie.poster_url
    ? `${TMDB_imgBaseUrl}${movie.poster_url}`
    : "source/img/no-poster.jpg";

  return `
    <div class="pelicula__card">
      <a class="pelicula__card__link" href="entrada.html?id=${movie.pelicula_id}">
        <img src="${posterPath}" alt="${movie.titulo}" loading="lazy" />
        <section class="pelicula__card__info">
          <h1>${movie.titulo}</h1>
          <section class="pelicula__card__info__puntaje">
            <h2><i class="fa-brands fa-imdb"></i> ${movie.calificacion || "N/A"}</h2>
          </section>
        </section>
      </a>
    </div>
  `;
}
