import { fetchFromApi } from "../../api/components/FetchFromApi.js";

let currentSlide = 0;
let carouselInterval = null;

async function initializeCarousel() {
  const backgroundSlider = document.querySelector(".background-slider");
  if (!backgroundSlider) return; // Si no existe, salir inmediatamente

  try {
    const data = await fetchFromApi("movie/top_rated");
    const slidesData = data.results.slice(0, 5);

    backgroundSlider.innerHTML = "";

    slidesData.forEach((movie, index) => {
      if (!movie.backdrop_path) return;

      const slide = document.createElement("div");
      slide.className = `slide ${index === 0 ? "active" : ""}`;
      slide.style.backgroundImage = `url(https://media.themoviedb.org/t/p/w1280/${movie.backdrop_path})`;

      const overlay = document.createElement("div");
      overlay.className = "slide-overlay";
      slide.appendChild(overlay);

      backgroundSlider.appendChild(slide);
    });

    currentSlide = 0;
    startCarouselRotation();
  } catch (error) {
    console.warn("Error inicializando carousel:", error);
  }
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  slides[currentSlide].classList.remove("active");
  currentSlide = index % slides.length;
  slides[currentSlide].classList.add("active");
}

function startCarouselRotation() {
  if (carouselInterval) clearInterval(carouselInterval);

  carouselInterval = setInterval(() => {
    const slides = document.querySelectorAll(".slide");
    if (slides.length) goToSlide(currentSlide + 1);
  }, 5000);
}

function resetCarouselRotation() {
  if (carouselInterval) clearInterval(carouselInterval);
  startCarouselRotation();
}

// Solo inicializar si existe el slider
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".background-slider")) {
    initializeCarousel();
  }
});

export { initializeCarousel, resetCarouselRotation };
