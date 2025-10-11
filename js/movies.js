let movieId = null;

function getMovieId() {
    if (!movieId) {
        movieId = new URLSearchParams(window.location.search).get("id");
    }
    return movieId;
}

function setMovieId(id) {
    if (!id) {
        console.error("Invalid movie ID provided");
        return null;
    }
    movieId = id;
    return movieId;
}

// Helper function to get the best poster for current language
export function getBestPosterForLanguage(images, currentLanguage) {
    if (!images || !images.posters || !images.posters.length) {
      return null;
    }
    
    const languageCode = currentLanguage.split('-')[0]; // Get language code (e.g., 'es' from 'es-ES')
    
    // First try to find a poster in the current language
    let bestPoster = images.posters.find(poster => poster.iso_639_1 === languageCode);
    
    // If not found, try English
    if (!bestPoster) {
      bestPoster = images.posters.find(poster => poster.iso_639_1 === 'en');
    }
    
    // If still not found, use the first available poster
    if (!bestPoster) {
      bestPoster = images.posters[0];
    }
    
    return bestPoster;
  }
  
  // Helper function to get the best backdrop for current language
  export function getBestBackdropForLanguage(images, currentLanguage) {
    if (!images || !images.backdrops || !images.backdrops.length) {
      return null;
    }
    
    const languageCode = currentLanguage.split('-')[0]; // Get language code (e.g., 'es' from 'es-ES')
    
    // First try to find a backdrop in the current language
    let bestBackdrop = images.backdrops.find(backdrop => backdrop.iso_639_1 === languageCode);
    
    // If not found, try English
    if (!bestBackdrop) {
      bestBackdrop = images.backdrops.find(backdrop => backdrop.iso_639_1 === 'en');
    }
    
    // If still not found, use the first available backdrop
    if (!bestBackdrop) {
      bestBackdrop = images.backdrops[0];
    }
    
    return bestBackdrop;
  }

export { getMovieId, setMovieId };