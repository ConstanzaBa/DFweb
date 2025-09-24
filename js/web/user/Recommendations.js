import { API_BASE_URL } from "../../utils/config.js";
import { fetchFromApi } from "../../api/components/FetchFromApi.js";

/**
 * Obtiene las mejores películas del usuario desde tu API interna
 * y devuelve hasta 10 recomendaciones combinadas desde TMDB.
 */
export async function getRecommendationsByUser() {
    const token = localStorage.getItem("token"); 
    if (!token) {
        // No hay usuario loggeado
        return [];
    }

    try {
        // Llamada a tu endpoint interno que devuelve las mejores películas del usuario
        const response = await fetch(`${API_BASE_URL}/Recommendations/GetBestRatedMoviesByUser.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Error HTTP en getRecommendationsByUser:", response.status, text);
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();

        if (!data.success || !data.movies || data.movies.length === 0) {
            return [];
        }

        // Traer recomendaciones de TMDB por cada película representativa
        const recommendationPromises = data.movies.map(async (movie) => {
            try {
                return await fetchFromApi.movieRecommendations(movie.pelicula_id, 5);
            } catch (err) {
                console.error(`Error obteniendo recomendaciones de TMDB para ${movie.pelicula_id}:`, err);
                return [];
            }
        });

        const recommendationsArrays = await Promise.all(recommendationPromises);

        // Unir todas las recomendaciones y eliminar duplicados
        const combined = [];
        const seenIds = new Set();
        for (const recs of recommendationsArrays) {
            for (const movie of recs) {
                if (!seenIds.has(movie.id)) {
                    combined.push(movie);
                    seenIds.add(movie.id);
                }
            }
        }

        // Devolver hasta 10 recomendaciones finales
        return combined.slice(0, 10);

    } catch (error) {
        console.error("Error en getRecommendationsByUser:", error);
        return [];
    }
};
