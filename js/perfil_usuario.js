import { TMDB_apiUrl, TMDB_apiKey, TMDB_imgBaseUrl, language } from "./utils/consts.js";
import { getUserId } from "./users.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const userId = getUserId();

  if (loginForm) {
    setupLoginForm();
  } else if (userId) {
    console.log("Sesión activa, cargando datos del usuario:", userId);
    setupProfileData(userId);
    setupProfileFunctionality();
  } else {
    console.error("No hay sesión activa");
  }
});

function setupLoginForm() {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("username", document.getElementById("username").value);
    formData.append("password", document.getElementById("password").value);

    try {
      const response = await fetch("php/login.php", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await response.json();
      console.log(data.success ? "Login exitoso" : "Error en el login:", data);
    } catch (error) {
      console.error("Login error:", error);
    }
  });
}

async function setupProfileData(userId) {
  try {
    const response = await fetch(`php/userdata.php?user_id=${userId}`);
    const data = await response.json();

    // Update user info
    const userInfo = {
      nombreUsuario: data.usuario || "N/A",
      emailUsuario: data.email || "N/A",
      avatarUsuario: data.avatar || "source/img/usuario.jpg",
      moviesFavorited: data.stats?.peliculas_favoritas || 0,
      moviesReviewed: data.stats?.reviews_realizadas || 0
    };

    Object.entries(userInfo).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element[id === "avatarUsuario" ? "src" : "textContent"] = value;
      }
    });

    // Update circles if they exist
    const circles = document.querySelectorAll(".circle .percentage");
    if (circles.length > 1 && data.stats) {
      circles[0].textContent = `${data.stats.avg_rating_peliculas || 0}%`;
      circles[1].textContent = `${data.stats.avg_rating_reviews || 0}%`;
    }

    updateProfileFavorites(userId);
    updateProfileReviews(userId);
  } catch (error) {
    console.error("Error al cargar los datos del perfil:", error);
  }
}

export function updateProfileFavorites() {
  fetch(`php/favoritos.php?user_id=${getUserId("user_id")}`)
    .then(response => response.json())
    .then(data => {
      const favoritesList = document.getElementById("favoriteMoviesList");
      if (!favoritesList) return;

      favoritesList.innerHTML = "";

      if (data?.favorites?.length > 0) {
        data.favorites.forEach(movie => {
          const card = createMovieCard(movie);
          favoritesList.appendChild(card);
        });
      } else {
        favoritesList.innerHTML = `
          <div class="empty-state">
            <p class="empty-state-message">No hay películas favoritas.</p>
            <p class="empty-state-submessage">Agrega películas a tus favoritos para verlas aquí.</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error("Error al actualizar la lista de favoritos:", error);
      const favoritesList = document.getElementById("favoriteMoviesList");
      if (favoritesList) {
        favoritesList.innerHTML = `
          <div class="error-state">
            <p>Error al cargar las películas favoritas.</p>
            <p>Por favor, intenta de nuevo más tarde.</p>
          </div>
        `;
      }
    });
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "pelicula__card";
  card.innerHTML = `
    <a class="pelicula__card__link" href="entrada.html?id=${movie.pelicula_id}">
      <img src="${movie.poster_url ? TMDB_imgBaseUrl + movie.poster_url : "source/img/no-poster.jpg"}" 
           alt="${movie.titulo || "Título no disponible"}" />
      <section class="pelicula__card__info">
        <h1>${movie.titulo || "Título no disponible"}</h1>
        <section class="pelicula__card__info__puntaje">
          <h2><i class="fa-brands fa-imdb"></i> ${movie.calificacion || "N/A"}</h2>
        </section>
      </section>
    </a>
  `;
  return card;
}

function updateProfileReviews() {
  fetch(`php/userdata.php?user_id=${getUserId("user_id")}`)
    .then(response => response.json())
    .then(data => {
      const reviewsContainer = document.getElementById("opinionCardsList");
      if (!reviewsContainer) return;

      reviewsContainer.innerHTML = "";
      
      if (Array.isArray(data.reviews)) {
        data.reviews.forEach(review => {
          const div = document.createElement("div");
          div.className = "card";
          div.innerHTML = `
            <div class="card__header">
              <h3>${review.titulo}</h3>
            </div>
            <div class="card__body">
              <p>${review.review}</p>
            </div>
            <div class="card__footer">
              <p>${review.puntuacion}</p>
            </div>
          `;
          reviewsContainer.appendChild(div);
        });
      } else {
        console.error("Formato de datos incorrecto:", data);
      }
    })
    .catch(error => {
      console.error("Error al obtener las reseñas:", error);
    });
}

function setupProfileFunctionality() {
  const elements = {
    addFavoriteButton: document.getElementById("addFavoriteButton"),
    movieModal: document.getElementById("movieModal"),
    confirmAddMovie: document.getElementById("confirmAddMovie"),
    cancelAddMovie: document.getElementById("cancelAddMovie"),
    movieSelectFavorite: document.getElementById("movieSelectFavorite"),
    movieSelectReview: document.getElementById("movieSelectReview"),
    addReviewButton: document.getElementById("addReviewButton"),
    reviewModal: document.getElementById("reviewModal"),
    reviewText: document.getElementById("reviewText"),
    confirmAddReview: document.getElementById("confirmAddReview"),
    cancelAddReview: document.getElementById("cancelAddReview")
  };

  // Setup modal events
  elements.addFavoriteButton?.addEventListener("click", () => {
    fetchMoviesList(elements.movieSelectFavorite, "movie/popular");
    elements.movieModal.style.display = "block";
  });

  elements.addReviewButton?.addEventListener("click", () => {
    fetchMoviesList(elements.movieSelectReview, "movie/popular");
    elements.reviewModal.style.display = "block";
  });

  elements.cancelAddMovie?.addEventListener("click", () => {
    elements.movieModal.style.display = "none";
  });

  elements.cancelAddReview?.addEventListener("click", () => {
    elements.reviewModal.style.display = "none";
    elements.reviewText.value = "";
    const rating = document.querySelector('input[name="rate"]:checked');
    if (rating) rating.checked = false;
  });

  // Setup confirm events
  elements.confirmAddMovie?.addEventListener("click", () => handleAddMovie(elements));
  elements.confirmAddReview?.addEventListener("click", () => handleAddReview(elements));
}

async function handleAddMovie(elements) {
  const selectedMovieId = elements.movieSelectFavorite.value;
  if (!selectedMovieId) {
    alert("Por favor, selecciona una película.");
    return;
  }

  try {
    const movieResponse = await fetch(
      `${TMDB_apiUrl}/movie/${selectedMovieId}?api_key=${TMDB_apiKey}&language=${language}`
    );
    if (!movieResponse.ok) throw new Error(`Error al obtener datos de la película: ${movieResponse.status}`);
    
    const movie = await movieResponse.json();
    const formData = new FormData();
    Object.entries({
      pelicula_id: selectedMovieId,
      title: movie.title,
      poster_path: movie.poster_path,
      calificacion: movie.vote_average,
      api_id: selectedMovieId,
      usuario_id: getUserId()
    }).forEach(([key, value]) => formData.append(key, value));

    const response = await fetch("php/favoritos.php", { method: "POST", body: formData });
    const data = await response.json();
    
    if (data.status === 200) {
      alert("Pelicula agregada!");
      elements.movieModal.style.display = "none";
      updateProfileFavorites();
    } else {
      alert("Error al agregar la pelicula.");
    }
  } catch (error) {
    console.error("Error al agregar la película a favoritos:", error);
    alert("No se pudo agregar la película.");
  }
}

async function handleAddReview(elements) {
  const selectedMovieId = elements.movieSelectReview.value;
  const selectedMovieTitle = elements.movieSelectReview.options[elements.movieSelectReview.selectedIndex].textContent;
  const rating = document.querySelector('input[name="rate"]:checked');
  const reviewContent = elements.reviewText.value;

  if (!selectedMovieId) {
    alert("Por favor, selecciona una película.");
    return;
  }
  if (!rating) {
    alert("Por favor, califica la película.");
    return;
  }
  if (!reviewContent) {
    alert("Por favor, escribe una reseña.");
    return;
  }

  try {
    const response = await fetch("php/reviews.php", {
      method: "POST",
      body: `usuario_id=${encodeURIComponent(getUserId("user_id"))}&pelicula_id=${encodeURIComponent(selectedMovieId)}&titulo=${encodeURIComponent(selectedMovieTitle)}&review=${encodeURIComponent(reviewContent)}&puntuacion=${encodeURIComponent(Number(rating.value))}`
    });
    const data = await response.json();

    if (data.status === 200) {
      alert("¡Reseña agregada!");
      elements.reviewModal.style.display = "none";
      elements.reviewText.value = "";
      rating.checked = false;
      updateProfileReviews();
    } else {
      alert("Error al agregar la reseña.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo agregar la reseña.");
  }
}

async function fetchMoviesList(selectElement, endpoint) {
  if (!selectElement) return;

  try {
    selectElement.innerHTML = "<option>Cargando películas...</option>";
    const response = await fetch(
      `${TMDB_apiUrl}/${endpoint}?api_key=${TMDB_apiKey}&language=${language}&append_to_response=videos,images`
    );
    const data = await response.json();
    
    selectElement.innerHTML = "";
    data.results.forEach(movie => {
      const option = document.createElement("option");
      option.value = movie.id;
      option.textContent = movie.title;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener la lista de películas:", error);
    selectElement.innerHTML = "<option>Error al cargar películas</option>";
  }
}