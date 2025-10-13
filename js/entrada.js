import { TMDB_imgBaseUrl, MAX_BACKDROPS_TO_SHOW } from "./utils/consts.js";
import { getCurrentLanguage, toggleLanguage, changeLanguage, updateTranslations } from "./utils/i18n.js";
import { getMovieId, setMovieId } from "./movies.js";
import { fetchFromApi } from "./api/components/FetchFromApi.js";
import { setupFavoriteButton } from "./web/components/FavoriteButton.js";
import { renderReviews, setupReviewForm } from "./web/components/Reviews.js"; // módulo de reseñas

let language = getCurrentLanguage();

document.addEventListener("DOMContentLoaded", () => {
  changeLanguage(language);
  updateTranslations();

  const movieId = getMovieId();
  if (!movieId) {
    console.error("No movie ID found in the URL parameters.");
    alert("No se encontró la película.");
    return;
  }

  setMovieId(movieId);

  // --------------------- Cargar detalles de la película ---------------------
  fetchFromApi.movieDetails(movieId)
    .then(async movieData => {
      displayMovieDetails(movieData);
      if (movieData.credits) displayMovieCast(movieData.credits);
      if (movieData.images) displayMovieMultimedia(movieData.images, movieData);

      // Inicializar botón de favoritos
      await setupFavoriteButton(movieId, movieData);
    })
    .catch(error => console.error("Error loading movie details:", error));

  // --------------------- Cargar proveedores de streaming ---------------------
  loadStreamingProviders(movieId);

  // --------------------- Language change event listener ---------------------
  document.addEventListener('languageChanged', (event) => {
    language = event.detail.language;
    updateTranslations();

    // Reload movie details with new language
    fetchFromApi.movieDetails(movieId)
      .then(async movieData => {
        displayMovieDetails(movieData);
        if (movieData.credits) displayMovieCast(movieData.credits);
        if (movieData.images) displayMovieMultimedia(movieData.images, movieData);

        await setupFavoriteButton(movieId, movieData);
      })
      .catch(error => console.error("Error reloading movie details:", error));

    // Reload streaming providers with new language
    loadStreamingProviders(movieId);
  });

  // --------------------- Renderizar reseñas dinámicamente ---------------------
  renderReviews(movieId);
  setupReviewForm(movieId);

  // --------------------- Test function for debugging ---------------------
  window.testStreamingProviders = function(testMovieId = movieId) {
    console.log(`Testing streaming providers for movie ID: ${testMovieId}`);
    loadStreamingProviders(testMovieId);
  };
});

// --------------------- FUNCIONES DE DISPLAY ---------------------

function displayMovieDetails(movie) {
  const poster = document.querySelector(".entrada__info__poster");
  if (!poster) return;

  const placeholder = "source/img/placeholder.jpg";
  poster.src = placeholder;
  poster.alt = movie.title;

  const actualPoster = new Image();
  actualPoster.src = `${TMDB_imgBaseUrl}${movie.poster_path}`;
  actualPoster.onload = () => {
    poster.src = actualPoster.src;
  };

  document.querySelector(".entrada__info__facts__release").innerText = new Date(movie.release_date).toLocaleDateString();
  document.querySelector(".entrada__info__facts__time").innerText = `${Math.floor(movie.runtime / 60)}h${movie.runtime % 60}m`;
  document.querySelector(".entrada__info__title").textContent = movie.title;
  document.querySelector(".entrada__info__heading").innerText = language.startsWith("es") ? "Sinopsis" : "Overview";
  document.querySelector(".entrada__info__texto").innerText = movie.overview;
}

function displayMovieCast(castData) {
  const castList = document.querySelector(".entrada__info__elenco__lista ul");
  castList.innerHTML = "";

  castData.cast.slice(0, 6).forEach(actor => {
    const actorElement = document.createElement("li");
    actorElement.className = "actor-card";

    const actorImage = document.createElement("img");
    actorImage.className = "actor-image";
    actorImage.alt = actor.name;

    const placeholder = "source/img/placeholder.jpg";
    actorImage.src = placeholder;

    if (actor.profile_path) {
      const actualImage = new Image();
      actualImage.src = `${TMDB_imgBaseUrl}${actor.profile_path}`;
      actualImage.onload = () => {
        actorImage.src = actualImage.src;
      };
    }

    const actorName = document.createElement("p");
    actorName.className = "actor-name";
    actorName.textContent = actor.name;

    const characterName = document.createElement("p");
    characterName.className = "character-name";
    characterName.textContent = actor.character;

    actorElement.append(actorImage, actorName, characterName);
    castList.appendChild(actorElement);
  });
}

function displayMovieMultimedia(imageData, movieData) {
  const imageList = document.querySelector(".entrada__multimedia__lista");
  imageList.innerHTML = "";

  const trailer = findAppropriateTrailer(movieData.videos, language);

  if (trailer) {
    const trailerItem = createListItem(`https://img.youtube.com/vi/${trailer.key}/0.jpg`, language.startsWith("es") ? "Tráiler" : "Trailer", 0);
    imageList.appendChild(trailerItem);
  }

  imageData.backdrops.slice(0, MAX_BACKDROPS_TO_SHOW).forEach((image, index) => {
    const listItem = createListItem(`${TMDB_imgBaseUrl}${image.file_path}`, language.startsWith("es") ? `Captura ${index + 1}` : `Backdrop ${index + 1}`, trailer ? index + 1 : index);
    imageList.appendChild(listItem);
  });

  updateMainContent(trailer ? "trailer" : "image", trailer || imageData.backdrops[0]);

  const listItems = document.querySelectorAll(".entrada__multimedia__lista .lista");
  listItems.forEach((item, index) => {
    item.onclick = () => {
      listItems.forEach(remove => remove.classList.remove("activa"));
      item.classList.add("activa");

      if (index === 0 && trailer) updateMainContent("trailer", trailer);
      else {
        const imageIndex = trailer ? index - 1 : index;
        updateMainContent("image", imageData.backdrops[imageIndex]);
      }
    };
  });
}

// --------------------- FUNCIONES AUXILIARES ---------------------

function loadStreamingProviders(movieId) {
  console.log('loadStreamingProviders called with movieId:', movieId);
  
  fetchFromApi.streamingProviders(movieId)
    .then(streamingProviders => {
      console.log('Success! streamingProviders received:', streamingProviders);
      
      if (streamingProviders && streamingProviders.length > 0) {
        console.log('Providers found, calling updateStreamingIcons');
        updateStreamingIcons(streamingProviders);
        console.log(`Loaded ${streamingProviders.length} streaming providers for movie ${movieId}`);
      } else {
        console.log('No providers found');
        const streamingList = document.querySelector(".entrada__info__streaming__menu ul");
        if (streamingList) {
          streamingList.innerHTML = `<li><p>${language.startsWith("es") ? "No hay proveedores de streaming disponibles para esta región" : "No streaming providers available for this region"}</p></li>`;
        }
      }
    })
    .catch(error => {
      console.error("Error loading streaming providers:", error);
      // Show error message
      const streamingList = document.querySelector(".entrada__info__streaming__menu ul");
      if (streamingList) {
        streamingList.innerHTML = `<li><p>${language.startsWith("es") ? "Error al cargar proveedores de streaming" : "Error loading streaming providers"}</p></li>`;
      }
    });
}

function updateStreamingIcons(streamingProviders) {
  const streamingList = document.querySelector(".entrada__info__streaming__menu ul");
  
  console.log('streamingList element:', streamingList);
  console.log('streamingProviders:', streamingProviders);
  
  if (!streamingList) {
    console.error('Streaming list element not found');
    return;
  }
  
  streamingList.innerHTML = "";

  streamingProviders.forEach((provider, index) => {
    console.log(`Processing provider ${index}:`, provider);
    
    const li = document.createElement("li");
    
    // Use the link from MOTN API directly
    const link = document.createElement("a");
    link.href = provider.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = `Watch on ${provider.name}`;

    const img = document.createElement("img");
    img.className = "streaming-icon";
    img.src = provider.image;
    img.alt = provider.name;
    img.style.maxWidth = "50px";
    img.style.height = "50px";
    
    console.log(`Image src for ${provider.name}:`, img.src);

    link.appendChild(img);
    li.appendChild(link);

    streamingList.appendChild(li);
    console.log(`Added ${provider.name} to streaming list`);
  });
  
  console.log('Final streamingList HTML:', streamingList.innerHTML);
}

function createListItem(src, text, index) {
  const listItem = document.createElement("div");
  listItem.className = "lista" + (index === 0 ? " activa" : "");

  const img = document.createElement("img");
  img.className = "imagen-lista";
  img.alt = text;

  const placeholder = "source/img/placeholder.jpg";
  img.src = placeholder;

  const actualImage = new Image();
  actualImage.src = src;
  actualImage.onload = () => {
    img.src = actualImage.src;
  };

  const textH3 = document.createElement("h3");
  textH3.className = "video-lista-texto";
  textH3.textContent = text;

  listItem.append(img, textH3);
  return listItem;
}

function updateMainContent(type, data) {
  const mainContainer = document.querySelector(".entrada__multimedia__principal");
  mainContainer.innerHTML = "";

  if (type === "trailer") {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${data.key}`;
    iframe.width = "100%";
    iframe.height = "400";
    iframe.style.border = "none";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    mainContainer.appendChild(iframe);
  } else {
    const mainImage = document.createElement("img");
    mainImage.className = "imagen-principal";
    mainImage.alt = "Imagen principal";

    const placeholder = "source/img/placeholder.jpg";
    mainImage.src = placeholder;

    const actualImage = new Image();
    actualImage.src = `${TMDB_imgBaseUrl}${data.file_path}`;
    actualImage.onload = () => {
      mainImage.src = actualImage.src;
    };

    mainContainer.appendChild(mainImage);
  }

  const mainTextH3 = document.createElement("h3");
  mainTextH3.className = "video-principal-texto";
  mainTextH3.textContent = type === "trailer" ? "Tráiler" : "Captura";
  mainContainer.appendChild(mainTextH3);
}

function findAppropriateTrailer(videos, language) {
  let trailer = videos?.results.find(video => video.type === "Trailer" && video.site === "YouTube" && video.iso_639_1 === language.split("-")[0]);
  if (!trailer) trailer = videos?.results.find(video => video.type === "Trailer" && video.site === "YouTube" && video.iso_639_1 === "en");
  if (!trailer) trailer = videos?.results.find(video => video.type === "Trailer" && video.site === "YouTube");
  return trailer;
}