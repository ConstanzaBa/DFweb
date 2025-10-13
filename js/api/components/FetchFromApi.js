import { TMDB_apiKey, TMDB_apiUrl, MOTN_apiKey, MOTN_apiUrl } from "../../utils/consts.js";
import { getCurrentLanguage } from "../../utils/i18n.js";


async function fetchFromApi(endpoint, params = {}) {
    const currentLanguage = getCurrentLanguage();
    const languageCode = currentLanguage.split('-')[0]; // Get language code (e.g., 'es' from 'es-ES')
    
    // Add language-specific image parameters for movie endpoints
    const enhancedParams = { ...params };
    if (endpoint.includes('movie/') && !endpoint.includes('/images')) {
      enhancedParams.include_image_language = `${languageCode},en,null`;
    }
    
    const queryParams = new URLSearchParams({
      api_key: TMDB_apiKey,
      language: currentLanguage,
      ...enhancedParams
    }).toString();
    
    try {
      const response = await fetch(`${TMDB_apiUrl}/${endpoint}?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error(`API error for ${endpoint}:`, error);
      throw error;
    }
}

// Obtener detalles completos de la película (incluye videos, images y credits)
fetchFromApi.movieDetails = async (movieId) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}`, {
      append_to_response: 'videos,images,credits'
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

// Obtener proveedores de streaming desde MOTN
fetchFromApi.streamingProviders = async (tmdbId) => {
  const currentLanguage = getCurrentLanguage();
  const languageCode = currentLanguage.split('-')[0];
  
  try {
    // Construir URL con lenguaje correcto
    const endpoint = `${MOTN_apiUrl}/shows/movie/${tmdbId}?output_language=${languageCode}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': MOTN_apiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data.streamingOptions) {
      const providers = [];
      
      try {
        Object.values(data.streamingOptions).forEach(regionArray => {
          // streamingOptions es un array de proveedores por región
          if (Array.isArray(regionArray)) {
            regionArray.forEach(item => {
              const provider = item?.service;
              
              if (provider && provider.id) {
                if (!providers.find(p => p.id === provider.id)) {
                  let image = '';
                  if (provider.imageSet) {
                    image = provider.imageSet.darkThemeImage || 
                            provider.imageSet.lightThemeImage || 
                            provider.imageSet.whiteImage ||
                            Object.values(provider.imageSet).find(val => typeof val === 'string') || '';
                  }

                  providers.push({
                    id: provider.id,
                    name: provider.name || '',
                    image: image || '',
                    link: item.link || ''
                  });
                }
              }
            });
          }
        });
      } catch (error) {
        console.error('Error parsing streamingOptions:', error);
      }
      return providers;
    }
    
    console.log('No streamingOptions found in MOTN API response');
    return [];
    
  } catch (error) {
    console.error("Error al obtener proveedores de streaming desde MOTN:", error);
    return [];
  }
};

// Obtener elenco de la película
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

// Obtener imágenes de la película
fetchFromApi.movieImages = async (movieId) => {
  try {
    const currentLanguage = getCurrentLanguage();
    const languageCode = currentLanguage.split('-')[0];
    
    const data = await fetchFromApi(`movie/${movieId}/images`, {
      include_image_language: `${languageCode},en,null`
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

// Obtener videos de la película
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

// Obtener recomendaciones de películas similares
fetchFromApi.movieRecommendations = async (movieId, limit = 5) => {
  try {
    const data = await fetchFromApi(`movie/${movieId}/recommendations`);
    if (data.success === false) throw new Error(data.status_message || "Error fetching recommendations");
    return data.results.slice(0, limit);
  } catch (error) {
    console.error("Error al obtener recomendaciones:", error);
    throw error;
  }
};

export { fetchFromApi };