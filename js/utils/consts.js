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
  
  337: "https://www.disneyplus.com/es-ar", 
  
  384: "https://www.hbomax.com/", 
  
  386: "https://www.peacocktv.com/search?keyword=", 
  531: "https://www.paramountplus.com/search/", 
  283: "https://www.crunchyroll.com/search?from=search&q=", 
  350: "https://tv.apple.com/",
};

// Translation
const translations = {
  "es-ES": {
    // --- Interfaz principal ---
    currentLanguage: "ES",
    logo: "DragonFilms",
    welcomeMessage: "Bienvenido.",
    welcomeSubtitle: "Millones de películas, series y personas por descubrir.",
    searchPlaceholder: "Busca lo que quieras ver...",

    // --- Secciones ---
    popularMovies: "Populares",
    nowPlaying: "En Cartelera",
    topRatedMovies: "Mejor Valoradas",
    upcomingMovies: "Próximos Estrenos",
    userRecommendations: "Basadas en tus Favoritos",

    // --- Película ---
    sinopsis: "Sinopsis",
    overview: "Sinopsis",
    releaseDate: "Fecha de estreno",
    runtime: "Duración",
    year: "Año",
    minutes: "min",
    rating: "Calificación",

    // --- Multimedia ---
    cinemas: "Cines",
    streaming: "Streaming",
    trailer: "Tráiler",
    captura: "Captura",
    noStreamingProviders: "No hay proveedores de streaming disponibles para esta región",
    watchOn: "Ver en",

    // --- Usuario ---
    profile: "Perfil",
    settings: "Configuración",
    logout: "Cerrar sesión",
    login: "Iniciar Sesión",
    user: "Usuario",
    enterUsername: "Ingresa tu usuario",
    profileReviews: "Reseñas",
    profileFavorites: "Favoritos",
    userRecents: "Recientes",

    // --- Favoritos ---
    addedToFavorites: "¡Agregado a favoritos!",
    removedFromFavorites: "Eliminado de favoritos",
    loginToAddFavorites: "Debes iniciar sesión para agregar favoritos",
    favMovies: "Favoritas",
    loginRequiredForFavorites: "Debes iniciar sesión para usar favoritos",
    favoriteCheckError: "Error al verificar favorito",
    favoriteUpdateError: "Error al actualizar favorito",
    favoritesError: "Error en favoritos:",
    errorLoadingFavorites: "Error al cargar tus favoritos",
    noFavorites: "No tienes películas favoritas",

    // --- Reseñas ---
    reviews: "Reseñas",
    userReviews: "Reseñas",
    reviewTitle: "Título",
    reviewText: "Escribe tu reseña...",
    editReview: "Editar",
    deleteReview: "Eliminar",
    reviewDeleted: "Reseña eliminada con éxito.",
    errorDeletingReview: "No se pudo eliminar la reseña.",
    noReviews: "No has escrito ninguna reseña",
    noReviewsYet: "No hay reseñas aún.",
    loadingReviews: "Cargando reseñas...",
    reviewLoadError: "Error al cargar reseñas",
    reviewCheckError: "Error al verificar reseña existente",
    reviewCommentRequired: "Debes escribir un comentario y seleccionar una puntuación",
    reviewAdded: "Reseña agregada correctamente",
    reviewUpdated: "Reseña actualizada correctamente",
    reviewProcessError: "Error al procesar la reseña",
    reviewUnexpectedError: "Hubo un error al procesar la reseña:",
    alreadyReviewed: "Ya dejaste una reseña en esta película.",
    ratings: "calificaciones",

    // --- Errores generales ---
    noResults: "No se encontraron resultados",
    loadingMovies: "Cargando películas...",
    errorLoading: "Error al cargar contenido",
    noMoviesFound: "No se encontraron películas",
    noRecommendations: "No hay recomendaciones disponibles por el momento",
    errorLoadingRecommendations: "Error al cargar recomendaciones",
    tryAgainLater: "Por favor, intenta de nuevo más tarde",
    serverError: "Error en el servidor",
    requestError: "Error en la solicitud",
    unexpectedError: "Ocurrió un error inesperado",
    requestProcessingError: "Error al procesar la solicitud",
    connectionError: "Error de conexión",

    // --- Usuario / Autenticación ---
    usernameExists: "Nombre de usuario ya existe",
    nombreUsuarioObligatorio: "El nombre de usuario es obligatorio",
    usuarioNoDisponible: "El nombre de usuario no está disponible",
    usuarioDisponible: "Nombre de usuario disponible",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    passwordsNoCoinciden: "Las contraseñas no coinciden",
    allFieldsRequired: "Todos los campos son obligatorios",
    completeAllFields: "Completa todos los campos",
    loginError: "Usuario o contraseña incorrectos",
    loginProblem: "Hubo un problema al iniciar sesión. Intenta de nuevo.",
    noChangesMade: "No se han realizado cambios",
    userUpdated: "Usuario actualizado correctamente",
    userUpdateError: "Error al actualizar usuario",
    errorCargarUsuario: "Error al cargar los datos del usuario",

    // --- Código de recuperación ---
    codeSentCheckEmail: "Código enviado correctamente. Revisa tu correo.",
    codeSendError: "No se pudo enviar el código",
    newCodeSent: "Nuevo código enviado a tu correo",
    resendCodeError: "No se pudo reenviar el código",
    sessionInfoMissing: "No se encontró información de sesión. Vuelve a solicitar el código.",
    invalidOrExpiredCode: "Código inválido o expirado",
    codeExpired: "El código ha expirado. Serás redirigido al login.",

    // --- Contraseña / Cuenta ---
    passwordUpdated: "Contraseña actualizada correctamente",
    passwordUpdateError: "Error al actualizar la contraseña",
    cuentaEliminada: "Cuenta eliminada correctamente",
    noSePudoEliminarCuenta: "No se pudo eliminar la cuenta",
    errorEliminarCuenta: "Error al eliminar la cuenta",
    accountDeletionError: "Error al eliminar cuenta",
    errorCargarDatos: "Error al cargar datos. Redirigiendo al login...",
    
    // --- Registro ---
    errorEmailRequired: "El correo electrónico es obligatorio.",
    errorEmailInvalid: "El correo electrónico no es válido.",
    errorPasswordRequired: "Debes ingresar una contraseña.",
    errorPasswordShort: "La contraseña debe tener al menos 8 caracteres.",
    errorPasswordUppercase: "La contraseña debe incluir al menos una letra mayúscula.",
    errorPasswordSpecial: "La contraseña no debe contener caracteres especiales.",
    errorPasswordMismatch: "Las contraseñas no coinciden.",
    errorUsernameRequired: "El nombre de usuario es obligatorio.",
    errorGenderRequired: "Selecciona un género.",
    errorUsernameTaken: "El nombre de usuario ya está en uso.",
    errorEmailTaken: "El correo electrónico ya está registrado.",
    unexpectedError: "Ocurrió un error inesperado. Intenta nuevamente.",
    
    // --- Configuracion ---
    userLoadError: "Error al cargar los datos del usuario.",
    userUpdated: "Perfil actualizado correctamente.",
    userUpdateError: "No se pudo actualizar el perfil.",
    usernameRequired: "El nombre de usuario es obligatorio.",
    passwordMismatch: "Las contraseñas no coinciden.",
    usernameExists: "Ese nombre de usuario ya está en uso.",
    noChangesMade: "No se detectaron cambios.",
    accountDeleted: "Cuenta eliminada correctamente.",
    accountDeleteError: "No se pudo eliminar la cuenta.",
    requestError: "Error en la solicitud. Intenta nuevamente.",
    usernameAvailable: "Nombre de usuario disponible.",
    usernameNotAvailable: "Nombre de usuario no disponible.",
    noEmailAvailable: "Correo no registrado."
  },

  "en-US": {
    // --- Main Interface ---
    currentLanguage: "EN",
    logo: "DragonFilms",
    welcomeMessage: "Welcome.",
    welcomeSubtitle: "Millions of movies, series and people to discover.",
    searchPlaceholder: "Search for what you want to watch...",

    // --- Sections ---
    popularMovies: "Popular",
    nowPlaying: "Now Playing",
    topRatedMovies: "Top Rated",
    upcomingMovies: "Upcoming",
    userRecommendations: "Based on your Favorites",

    // --- Movie ---
    sinopsis: "Overview",
    overview: "Overview",
    releaseDate: "Release Date",
    runtime: "Runtime",
    year: "Year",
    minutes: "min",
    rating: "Rating",

    // --- Multimedia ---
    cinemas: "Cinemas",
    streaming: "Streaming",
    trailer: "Trailer",
    captura: "Backdrop",
    noStreamingProviders: "No streaming providers available for this region",
    watchOn: "Watch on",

    // --- User ---
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    user: "User",
    enterUsername: "Enter your username",
    profileReviews: "Reviews",
    profileFavorites: "Favorites",
    userRecents: "Recents",

    // --- Favorites ---
    addedToFavorites: "Added to favorites!",
    removedFromFavorites: "Removed from favorites",
    loginToAddFavorites: "You must login to add favorites",
    favMovies: "Favorites",
    loginRequiredForFavorites: "You must log in to use favorites",
    favoriteCheckError: "Error verifying favorite",
    favoriteUpdateError: "Error updating favorite",
    favoritesError: "Favorites error:",
    errorLoadingFavorites: "Error loading your favorites",
    noFavorites: "You don't have any favorite movies",

    // --- Reviews ---
    reviews: "Reviews",
    userReviews: "Reviews",
    reviewTitle: "Title",
    reviewText: "Write your review...",
    editReview: "Edit",
    deleteReview: "Delete",
    reviewDeleted: "Review deleted successfully",
    errorDeletingReview: "Error deleting review",
    noReviews: "You haven't written any reviews",
    noReviewsYet: "No reviews yet.",
    loadingReviews: "Loading reviews...",
    reviewLoadError: "Error loading reviews",
    reviewCheckError: "Error checking existing review",
    reviewCommentRequired: "You must write a comment and select a rating",
    reviewAdded: "Review added successfully",
    reviewUpdated: "Review updated successfully",
    reviewProcessError: "Error processing the review",
    reviewUnexpectedError: "There was an error processing the review:",
    alreadyReviewed: "You have already reviewed this movie.",
    ratings: "ratings",

    // --- Errors ---
    noResults: "No results found",
    loadingMovies: "Loading movies...",
    errorLoading: "Error loading content",
    noMoviesFound: "No movies found",
    noRecommendations: "No recommendations available at the moment",
    errorLoadingRecommendations: "Error loading recommendations",
    tryAgainLater: "Please try again later",
    serverError: "Server error",
    requestError: "Request error",
    unexpectedError: "An unexpected error occurred",
    requestProcessingError: "Error processing request",
    connectionError: "Connection error",

    // --- User / Auth ---
    usernameExists: "Username already exists",
    nombreUsuarioObligatorio: "Username is required",
    usuarioNoDisponible: "Username not available",
    usuarioDisponible: "Username available",
    passwordsDoNotMatch: "Passwords do not match",
    passwordsNoCoinciden: "Passwords do not match",
    allFieldsRequired: "All fields are required",
    completeAllFields: "Complete all fields",
    loginError: "Incorrect username or password",
    loginProblem: "There was a problem logging in. Please try again.",
    noChangesMade: "No changes were made",
    userUpdated: "User updated successfully",
    userUpdateError: "Error updating user",
    errorCargarUsuario: "Error loading user data",

    // --- Recovery Code ---
    codeSentCheckEmail: "Code sent successfully. Check your email.",
    codeSendError: "Could not send the code",
    newCodeSent: "New code sent to your email",
    resendCodeError: "Could not resend the code",
    sessionInfoMissing: "No session information found. Please request the code again.",
    invalidOrExpiredCode: "Invalid or expired code",
    codeExpired: "The code has expired. You will be redirected to login.",

    // --- Password / Account ---
    passwordUpdated: "Password updated successfully",
    passwordUpdateError: "Error updating password",
    cuentaEliminada: "Account deleted successfully",
    noSePudoEliminarCuenta: "Could not delete the account",
    errorEliminarCuenta: "Error deleting the account",
    accountDeletionError: "Error deleting account",
    errorCargarDatos: "Error loading data. Redirecting to login...",
    
    // --- Register ---
    errorEmailRequired: "Email is required.",
    errorEmailInvalid: "Invalid email address.",
    errorPasswordRequired: "You must enter a password.",
    errorPasswordShort: "Password must be at least 8 characters long.",
    errorPasswordUppercase: "Password must contain at least one uppercase letter.",
    errorPasswordSpecial: "Password must not contain special characters.",
    errorPasswordMismatch: "Passwords do not match.",
    errorUsernameRequired: "Username is required.",
    errorGenderRequired: "Please select a gender.",
    errorUsernameTaken: "Username is already taken.",
    errorEmailTaken: "Email is already registered.",
    unexpectedError: "An unexpected error occurred. Please try again.",
    
    // --- Settings ---
    userLoadError: "Error loading user data.",
    userUpdated: "Profile updated successfully.",
    userUpdateError: "Profile update failed.",
    usernameRequired: "Username is required.",
    passwordMismatch: "Passwords do not match.",
    usernameExists: "This username is already taken.",
    noChangesMade: "No changes detected.",
    accountDeleted: "Account deleted successfully.",
    accountDeleteError: "Failed to delete account.",
    requestError: "Request error. Please try again.",
    usernameAvailable: "Username available.",
    usernameNotAvailable: "Username not available.",
    noEmailAvailable: "Email not registered."
  },
};


// ====================== FUNCIONES CORREGIDAS ======================

// TMDB solo usa códigos de 2 letras, no 'es-ES' o 'en-US'
function getBestPosterForLanguage(images, lang) {
  if (!images?.posters?.length) return null;
  const langCode = lang.split('-')[0]; // 'es-ES' => 'es'
  return images.posters.find(p => p.iso_639_1 === langCode) || images.posters[0];
}

function getBestBackdropForLanguage(images, lang) {
  if (!images?.backdrops?.length) return null;
  const langCode = lang.split('-')[0];
  return images.backdrops.find(b => b.iso_639_1 === langCode) || images.backdrops[0];
}

if (!TMDB_apiKey) {
  console.error("API key is missing. Please check your configuration.");
}

// ====================== EXPORTS ======================
export {
  TMDB_apiKey,
  TMDB_imgBaseUrl,
  TMDB_apiUrl,
  movieId,
  providerUrls,
  translations,
  currentMovieId,
  MINIMUM_GOOD_RATING,
  MAX_BACKDROPS_TO_SHOW,
  getBestPosterForLanguage,
  getBestBackdropForLanguage
};
