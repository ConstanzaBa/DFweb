// TMDB Api Config
const TMDB_apiKey = "37e6a3d75952343aefc02018d9108bbf";
const TMDB_imgBaseUrl = "https://image.tmdb.org/t/p/w500";
const TMDB_apiUrl = "https://api.themoviedb.org/3";

// Movie Config
const movieId = new URLSearchParams(window.location.search).get("id");
const currentMovieId = movieId;
const MINIMUM_GOOD_RATING = 3;
const MAX_BACKDROPS_TO_SHOW = 5;

const providerUrls = {
  2: "https://tv.apple.com/", 
  3: "https://play.google.com/store/search?q=", 
  7: "https://www.vudu.com/content/movies/search?searchTerm=", 
  8: "https://www.netflix.com/search?q=", 
  9: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=", 
  10: "https://www.amazon.com/s?k=", 
  11: "https://mubi.com/search/films?q=", 
  15: "https://www.hulu.com/search?q=", 
  43: "https://www.starz.com/us/en/search?q=", 
  337: "https://www.disneyplus.com/search/", 
  384: "https://play.max.com/search?q=", 
  386: "https://www.peacocktv.com/search?keyword=", 
  531: "https://www.paramountplus.com/search/", 
  283: "https://www.crunchyroll.com/search?from=search&q=", 
  350: "https://tv.apple.com/", 
};

// Translation
const translations = {
  "es-ES": {
    currentLanguage: "ES",
    // Mensajes principales
    welcomeMessage: "Bienvenido.",
    welcomeSubtitle: "Millones de peliculas, series y personas por descubrir.",
    searchPlaceholder: "Busca lo que quieras ver...",
    
    // Categorías de películas
    popularMovies: "Populares",
    nowPlaying: "En Cartelera",
    topRatedMovies: "Mejor Valoradas",
    upcomingMovies: "Próximos Estrenos",
    userRecommendations: "Basadas en tus Favoritos",
    
    // Página de película
    sinopsis: "Sinopsis",
    cinemas: "Cines",
    streaming: "Streaming",
    trailer: "Tráiler",
    captura: "Captura",
    reviews: "Reseñas",
    cast: "Elenco",
    multimedia: "Multimedia",
    
    // Header y navegación
    profile: "Perfil",
    settings: "Configuración",
    logout: "Cerrar sesión",
    
    // Favoritos
    addedToFavorites: "¡Agregado a favoritos!",
    removedFromFavorites: "Eliminado de favoritos",
    loginToAddFavorites: "Debes iniciar sesión para agregar favoritos",
    favMovies: "Favoritas",
    userReviews: "Reseñas",
    noFavorites: "No tienes películas favoritas",
    errorLoadingFavorites: "Error al cargar tus favoritos",
    editReview: "Editar",
    deleteReview: "Eliminar",
    reviewDeleted: "Reseña eliminada correctamente",
    errorDeletingReview: "Error al eliminar la reseña",
    noReviews: "No has escrito ninguna reseña",
    errorLoadingReviews: "Error al obtener reseñas",
    
    // Estados y mensajes
    noResults: "No se encontraron resultados",
    loadingMovies: "Cargando películas...",
    errorLoading: "Error al cargar contenido",
    noMoviesFound: "No se encontraron películas",
    noRecommendations: "No hay recomendaciones disponibles por el momento",
    errorLoadingRecommendations: "Error al cargar recomendaciones",
    tryAgainLater: "Por favor, intenta de nuevo más tarde",
    
    // Información de película
    releaseDate: "Fecha de estreno",
    runtime: "Duración",
    rating: "Calificación",
    overview: "Sinopsis",
    year: "Año",
    minutes: "min",
    
    // Streaming
    noStreamingProviders: "No hay proveedores de streaming disponibles para esta región",
    watchOn: "Ver en",
    
    // Logo
    logo: "DragonFilms"
  },
  "en-US": {
    currentLanguage: "EN",
    // Main messages
    welcomeMessage: "Welcome.",
    welcomeSubtitle: "Millions of movies, series and people to discover.",
    searchPlaceholder: "Search for what you want to watch...",
    
    // Movie categories
    popularMovies: "Popular",
    nowPlaying: "Now Playing",
    topRatedMovies: "Top Rated",
    upcomingMovies: "Upcoming",
    userRecommendations: "Based on your Favorites",
    
    // Movie page
    sinopsis: "Overview",
    cinemas: "Cinemas",
    streaming: "Streaming",
    trailer: "Trailer",
    captura: "Backdrop",
    reviews: "Reviews",
    cast: "Cast",
    multimedia: "Multimedia",
    
    // Header and navigation
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    
    // Favorites
    addedToFavorites: "Added to favorites!",
    removedFromFavorites: "Removed from favorites",
    loginToAddFavorites: "You must login to add favorites",
    favMovies: "Favorites",
    userReviews: "Reviews",
    noFavorites: "You don't have any favorite movies",
    errorLoadingFavorites: "Error loading your favorites",
    editReview: "Edit",
    deleteReview: "Delete",
    reviewDeleted: "Review deleted successfully",
    errorDeletingReview: "Error deleting review",
    noReviews: "You haven't written any reviews",
    errorLoadingReviews: "Error getting reviews",
    
    // States and messages
    noResults: "No results found",
    loadingMovies: "Loading movies...",
    errorLoading: "Error loading content",
    noMoviesFound: "No movies found",
    noRecommendations: "No recommendations available at the moment",
    errorLoadingRecommendations: "Error loading recommendations",
    tryAgainLater: "Please try again later",
    
    // Movie information
    releaseDate: "Release Date",
    runtime: "Runtime",
    rating: "Rating",
    overview: "Overview",
    year: "Year",
    minutes: "min",
    
    // Streaming
    noStreamingProviders: "No streaming providers available for this region",
    watchOn: "Watch on",
    
    // Logo
    logo: "DragonFilms"
  },
};

if (!TMDB_apiKey) {
  console.error("API key is missing. Please check your configuration.");
}

export { TMDB_apiKey, TMDB_imgBaseUrl, TMDB_apiUrl, movieId, providerUrls };
export { translations };
export { currentMovieId, MINIMUM_GOOD_RATING, MAX_BACKDROPS_TO_SHOW };