import { fetchFromApi } from "../../api/components/FetchFromApi.js";

let currentSlide = 0;
let carouselInterval = null;

async function initializeCarousel() {
  try {
    const data = await fetchFromApi("movie/top_rated");
    const slides = data.results.slice(0, 5);
    
    const backgroundSlider = document.querySelector('.background-slider');
    if (!backgroundSlider) {
      console.error('Background slider element not found');
      return;
    }
    
    backgroundSlider.innerHTML = '';
    
    slides.forEach((movie, index) => {
      if (!movie.backdrop_path) return;
      
      const slide = document.createElement('div');
      slide.className = `slide ${index === 0 ? 'active' : ''}`;
      
      const imageUrl = `https://media.themoviedb.org/t/p/w1280/${movie.backdrop_path}`;
      slide.style.backgroundImage = `url(${imageUrl})`;
      
      const overlay = document.createElement('div');
      overlay.className = 'slide-overlay';
      slide.appendChild(overlay);
      
      backgroundSlider.appendChild(slide);
    });
    
    // Reset current slide and start rotation
    currentSlide = 0;
    startCarouselRotation();
  } catch (error) {
    console.error('Error initializing carousel:', error);
  }
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  
  slides[currentSlide].classList.remove('active');
  currentSlide = index % slides.length;
  slides[currentSlide].classList.add('active');
}

function startCarouselRotation() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
  }
  
  carouselInterval = setInterval(() => {
    const slides = document.querySelectorAll('.slide');
    if (slides.length) {
      goToSlide(currentSlide + 1);
    }
  }, 5000);
}

function resetCarouselRotation() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
  }
  startCarouselRotation();
}

// Initialize carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCarousel);

export { initializeCarousel, resetCarouselRotation };