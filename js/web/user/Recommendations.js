import { API_BASE_URL } from "../../utils/config.js";
import { fetchFromApi } from "../../api/components/FetchFromApi.js";
import { getFavoritosByUser } from "../../api/endpoints/GetFavoritoByUser.js";

/**
 * Obtiene las mejores películas del usuario y devuelve recomendaciones desde TMDB,
 * filtrando los favoritos y evitando duplicados.
 */
export async function getRecommendationsByUser() {
    const token = localStorage.getItem("token"); 
    if (!token) return [];

    try {
        // Traer favoritos del usuario
        const favData = await getFavoritosByUser();
        const favoriteIds = (favData.success && Array.isArray(favData.favorites))
            ? favData.favorites.map(m => Number(m.pelicula_id))
            : [];

        // Obtener películas representativas
        const resp = await fetch(`${API_BASE_URL}/Recommendations/GetBestRatedMoviesByUser.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();
        if (!data.success || !data.movies || data.movies.length === 0) return [];

        // Obtener recomendaciones desde TMDB por cada película representativa
        const recommendationPromises = data.movies.map(async (movie) => {
            try {
                const recs = await fetchFromApi.movieRecommendations(Number(movie.pelicula_id), 10);
                return recs.map(r => ({ ...r, fromMovie: movie.pelicula_id }));
            } catch {
                return [];
            }
        });

        const recommendationsArrays = await Promise.all(recommendationPromises);

        // Combinar todas las recomendaciones, eliminar duplicados y las que ya están en favoritos
        const combined = [];
        const seenIds = new Set();
        for (const recs of recommendationsArrays) {
            for (const movie of recs) {
                const movieId = Number(movie.id);
                if (!seenIds.has(movieId) && !favoriteIds.includes(movieId)) {
                    combined.push(movie);
                    seenIds.add(movieId);
                }
            }
        }

        // Devolver hasta 10 recomendaciones finales
        return combined.slice(0, 10);

    } catch {
        return [];
    }
}
