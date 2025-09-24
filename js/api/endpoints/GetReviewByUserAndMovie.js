import { fetchConToken } from '../../utils/AuthFetch.js';

export async function getReviewByUserAndMovie(pelicula_id) {
    try {
        const response = await fetchConToken('/Review/GetReviewByUserAndMovie.php', {
            method: "POST",
            body: JSON.stringify({ pelicula_id }),
        });

        const text = await response.text();
       
        const data = text ? JSON.parse(text) : { success: false, error: "Respuesta vacía del servidor" };
        return data;
    } catch (err) {
        console.error("Error en getReviewByUserAndMovie:", err);
        return { success: false, error: err.message };
    }
}
