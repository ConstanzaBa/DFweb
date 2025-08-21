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
    welcomeMessage: "Bienvenido.",
    welcomeSubtitle: "Millones de peliculas, series y personas por descubrir.",
    searchPlaceholder: "Busca lo que quieras ver...",
    popularMovies: "Populares",
    nowPlaying: "En Cartelera",
    topRatedMovies: "Mejor Valoradas",
    upcomingMovies: "Próximos Estrenos",
    Sinopsis: "Sinopsis",
    cinemas: "Cines",
    streaming: "Streaming",
    trailer: "Trailer",
    captura: "Captura",
  },
  "en-US": {
    currentLanguage: "EN",
    welcomeMessage: "Welcome.",
    welcomeSubtitle: "Millions of movies, series and people to discover.",
    searchPlaceholder: "Search for what you want to watch...",
    popularMovies: "Popular",
    nowPlaying: "Now Playing",
    topRatedMovies: "Top Rated",
    upcomingMovies: "Upcoming",
    Sinopsis: "Overview",
    cinemas: "Cinemas",
    streaming: "Streaming",
    trailer: "Trailer",
    captura: "Capture",
  },
};

if (!TMDB_apiKey) {
  console.error("API key is missing. Please check your configuration.");
}

export { TMDB_apiKey, TMDB_imgBaseUrl, TMDB_apiUrl, movieId, providerUrls };
export { translations };
export { currentMovieId, MINIMUM_GOOD_RATING, MAX_BACKDROPS_TO_SHOW };