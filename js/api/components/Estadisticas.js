// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get cached data or fetch new data
async function getCachedData(key, fetchFn) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  apiCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Function to count movies from API
async function countMoviesOnPage(apiKey) {
  try {
    const data = await getCachedData('movieCount', async () => {
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    });

    return data.total_results
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } catch (error) {
    console.error("Error al obtener el conteo de películas:", error);
    return "0";
  }
}

// Function to render charts
async function renderChart(apiKey) {
  try {
    const data = await getCachedData('chartData', async () => {
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    });

    const ctx = document.getElementById('ratingChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.results.slice(0, 10).map(movie => movie.title),
        datasets: [{
          label: 'Calificación',
          data: data.results.slice(0, 10).map(movie => movie.vote_average),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  } catch (error) {
    console.error("Error al renderizar el gráfico:", error);
    document.getElementById('ratingChart').innerHTML = '<p class="error">Error al cargar el gráfico</p>';
  }
}

// Function to render genre chart
async function renderGenreChart(apiKey) {
  try {
    const data = await getCachedData('genreData', async () => {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    });

    const ctx = document.getElementById('genreChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.genres.map(genre => genre.name),
        datasets: [{
          data: data.genres.map(() => Math.floor(Math.random() * 100)), // Example data
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ]
        }]
      },
      options: {
        responsive: true
      }
    });
  } catch (error) {
    console.error("Error al renderizar el gráfico de géneros:", error);
    document.getElementById('genreChart').innerHTML = '<p class="error">Error al cargar el gráfico de géneros</p>';
  }
}

// Function to render movie count
async function renderMovieCount(apiKey) {
  try {
    const count = await countMoviesOnPage(apiKey);
    const element = document.getElementById('movieCount');
    if (element) {
      element.textContent = count;
    }
  } catch (error) {
    console.error("Error al renderizar el conteo de películas:", error);
  }
}

// Function to render user count
async function renderUserCount() {
  try {
    const response = await fetch('php/userdata.php?action=count');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    
    const element = document.getElementById('userCount');
    if (element) {
      element.textContent = data.count || '0';
    }
  } catch (error) {
    console.error("Error al renderizar el conteo de usuarios:", error);
  }
}

// Function to render review count
async function renderReviewCount() {
  try {
    const response = await fetch('php/reviews.php?action=count');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    
    const element = document.getElementById('reviewCount');
    if (element) {
      element.textContent = data.count || '0';
    }
  } catch (error) {
    console.error("Error al renderizar el conteo de reseñas:", error);
  }
}

// Function to render favorite count
async function renderFavoriteCount() {
  try {
    const response = await fetch('php/favoritos.php?action=count');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    
    const element = document.getElementById('favoriteCount');
    if (element) {
      element.textContent = data.count || '0';
    }
  } catch (error) {
    console.error("Error al renderizar el conteo de favoritos:", error);
  }
}

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "37e6a3d75952343aefc02018d9108bbf";
  
  // Render all statistics
  Promise.all([
    renderChart(apiKey),
    renderGenreChart(apiKey),
    renderMovieCount(apiKey),
    renderUserCount(),
    renderReviewCount(),
    renderFavoriteCount()
  ]).catch(error => {
    console.error("Error al inicializar las estadísticas:", error);
  });
});

document.getElementById("theme-toggle").addEventListener("click", function () {
  // Alternar la clase dark-mode en el body y en el navbar
  document.body.classList.toggle("dark-mode");
  const navbar = document.getElementById("navbar");
  // Cambiar el texto y el icono del botón
  // const icon = this.querySelector("i");
  if (document.body.classList.contains("dark-mode")) {
    this.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    navbar.classList.remove("navbar-light");
    navbar.classList.remove("bg-white");
    navbar.classList.add("navbar-dark");
    navbar.classList.add("bg-dark");
  } else {
    this.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    navbar.classList.add("navbar-light");
    navbar.classList.add("bg-white");
    navbar.classList.remove("navbar-dark");
    navbar.classList.remove("bg-dark");
  }
});
