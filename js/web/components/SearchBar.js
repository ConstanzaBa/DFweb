import { fetchFromApi } from "../../api/components/FetchFromApi.js";

function setupSearchHandlers() {
    const searchForm = document.getElementById('busqueda__barra');
    const searchButton = document.getElementById('busqueda__boton');
    const searchInput = document.querySelector('.busqueda__input');
    
    if (!searchForm || !searchButton || !searchInput) return;

    // Disable autocomplete
    searchInput.setAttribute('autocomplete', 'off');
    searchForm.setAttribute('autocomplete', 'off');

    let searchTimeout;

    // Handle input changes for real-time search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // If query is too short, clear results
        if (query.length < 2) {
            clearSearchResults();
            return;
        }

        // Set new timeout for search
        searchTimeout = setTimeout(() => {
            handleSearch(query);
        }, 300); // 300ms delay to prevent too many API calls
    });

    // Handle form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            handleSearch(query);
        }
    });

    // Handle search button click
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            handleSearch(query);
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            clearSearchResults();
        }
    });
}

async function handleSearch(query) {
    try {
        const data = await fetchFromApi('search/movie', { query });
        const moviesWithCast = await Promise.all(
            data.results.slice(0, 5).map(async (movie) => {
                try {
                    const credits = await fetchFromApi(`movie/${movie.id}/credits`);
                    const cast = credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
                    return { ...movie, cast };
                } catch (error) {
                    console.error(`Error fetching cast for movie ${movie.id}:`, error);
                    return { ...movie, cast: 'Cast information unavailable' };
                }
            })
        );
        displaySearchResults(moviesWithCast);
    } catch (error) {
        console.error('Error performing search:', error);
        showSearchError();
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-dropdown';
    
    if (!results.length) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No se encontraron resultados</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = results.map(movie => `
            <a href="entrada.html?id=${movie.id}" class="search-result-item">
                <div class="search-result-content">
                    <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'source/img/no-poster.jpg'}" 
                         alt="${movie.title}"
                         loading="lazy">
                    <div class="search-result-info">
                        <h3>${movie.title}</h3>
                        <p class="movie-year">${movie.release_date?.split('-')[0] || 'N/A'}</p>
                        <p class="movie-cast">${movie.cast || 'Cast information unavailable'}</p>
                    </div>
                </div>
            </a>
        `).join('');
    }

    // Remove existing results if any
    clearSearchResults();

    // Style the results container
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.display = 'flex';
    resultsContainer.style.flexDirection = 'column';
    resultsContainer.style.margin = '0.5rem';
    resultsContainer.style.borderRadius = '1rem';
    resultsContainer.style.top = '100%';
    resultsContainer.style.left = '0';
    resultsContainer.style.width = '100%';
    resultsContainer.style.height = '20rem';
    resultsContainer.style.maxHeight = '400px';
    resultsContainer.style.overflowY = 'scroll';
    resultsContainer.style.backgroundColor = 'var(--blanco)';
    resultsContainer.style.boxShadow = '0 4px 24px hsla(222, 68%, 12%, 0.1)';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.transition = 'all 0.3s ease';

    // Add new results
    const searchContainer = document.querySelector('.busqueda');
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(resultsContainer);
}

function clearSearchResults() {
    const existingResults = document.querySelector('.search-results-dropdown');
    if (existingResults) {
        existingResults.remove();
    }
}

function showSearchError() {
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-dropdown';
    resultsContainer.innerHTML = `
        <div class="search-error">
            <p>Error al realizar la búsqueda</p>
            <p>Por favor, intenta de nuevo más tarde</p>
        </div>
    `;

    clearSearchResults();
    const searchContainer = document.querySelector('.busqueda');
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(resultsContainer);
}

export { setupSearchHandlers };