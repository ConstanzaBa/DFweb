import { TMDB_apiKey, TMDB_apiUrl } from "../../utils/consts.js";
import { getCurrentLanguage } from "../../web/components/LanguageToggle.js";


async function fetchFromApi(endpoint, params = {}) {
    const currentLanguage = getCurrentLanguage();
    const queryParams = new URLSearchParams({
      api_key: TMDB_apiKey,
      language: currentLanguage,
      ...params
    }).toString();
    
    try {
      const response = await fetch(`${TMDB_apiUrl}/${endpoint}?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error(`API error for ${endpoint}:`, error);
      throw error;
    }
}

fetchFromApi.movieDetails = async (movieId) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}`, {
      append_to_response: "videos,images,credits",
      include_image_language: "en,null"
    });
    
    if (data.success === false) {
      throw new Error(data.status_message || 'Error fetching movie details');
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener detalles de la película:", error);
    throw error;
  }
};

fetchFromApi.movieProviders = async (movieId) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}/watch/providers`);
    
    if (data.success === false) {
      throw new Error(data.status_message || 'Error fetching providers');
    }
    
    return data.results;
  } catch (error) {
    console.error("Error al obtener proveedores de la película:", error);
    throw error;
  }
};

fetchFromApi.movieCast = async (movieId) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}/credits`);
    
    if (data.success === false) {
      throw new Error(data.status_message || 'Error fetching cast');
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener el elenco de la película:", error);
    throw error;
  }
};

fetchFromApi.movieImages = async (movieId) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}/images`, {
      include_image_language: "en,null"
    });
    
    if (data.success === false) {
      throw new Error(data.status_message || 'Error fetching images');
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener imágenes de la película:", error);
    throw error;
  }
};

fetchFromApi.movieVideos = async (movieId) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}/videos`);

    if (data.success === false) {
      throw new Error(data.status_message || 'Error fetching videos');
    }

    return data.results.filter(video =>
      ["Trailer", "Teaser", "Featurette"].includes(video.type) && video.site === "YouTube"
    );
  } catch (error) {
    console.error("Error al obtener videos de la película:", error);
    throw error;
  }
};


fetchFromApi.movieRecommendations = async (movieId, limit = 5) => {
    const data = await fetchFromApi(`movie/${movieId}/recommendations`);
    if (data.success === false) throw new Error(data.status_message || "Error fetching recommendations");
    return data.results.slice(0, limit);
};

export { fetchFromApi };