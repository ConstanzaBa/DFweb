import i18next from "i18next";

i18next.init({
  lng: localStorage.getItem("language") || "es", 
  fallbackLng: "es-ES",
  resources: {
    "es-ES": {
      translation: {
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
        
        // Estados y mensajes
        noResults: "No se encontraron resultados",
        loadingMovies: "Cargando películas...",
        errorLoading: "Error al cargar contenido",
        noMoviesFound: "No se encontraron películas",
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
      }
    },
    "en-US": {
      translation: {
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
        
        // States and messages
        noResults: "No results found",
        loadingMovies: "Loading movies...",
        errorLoading: "Error loading content",
        noMoviesFound: "No movies found",
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
      }
    }
  }
});

export default i18next;