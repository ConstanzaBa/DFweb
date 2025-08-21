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

export { getMovieId, setMovieId };