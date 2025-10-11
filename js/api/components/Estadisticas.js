import { API_BASE_URL } from "../../utils/config.js";

let chartAvg = null;

async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/Estadisticas/GetDashboard.php`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || "Error en la API");
    const stats = result.data;

    // Contadores
    document.getElementById('usuarios-registrados').textContent = stats.usuarios ?? 0;
    document.getElementById('cantidad-resenas').textContent = stats.reviews ?? 0;
    document.getElementById('cantidad-favoritos').textContent = stats.favoritos ?? 0;
    document.getElementById('peliculas-30-dias').textContent = stats.nuevos_usuarios ?? 0;

    // Top 5 favoritos
    const lista = document.getElementById("lista-top-favoritos");
    if (lista && Array.isArray(stats.top_favoritos)) {
      lista.innerHTML = "";
      const max = stats.top_favoritos[0]?.cantidad || 1;
      stats.top_favoritos.forEach((pelicula, index) => {
        const porcentaje = (pelicula.cantidad / max) * 100;
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center flex-column flex-sm-row";
        li.innerHTML = `
          <div class="w-100">
            <strong>${index + 1}. ${pelicula.titulo}</strong>
            <div class="progress progress-xs mt-2">
              <div class="progress-bar" style="width: ${porcentaje}%; background-color: var(--progress-color);"></div>
            </div>
          </div>
          <span class="badge mt-2 mt-sm-0">${pelicula.cantidad}</span>
        `;
        lista.appendChild(li);
      });
    }

    // Promedio de reseñas
    const promedio = Number(stats.promedio_reviews) || 0;
    document.getElementById("promedio-reseñas-num").textContent = promedio.toFixed(2) + " / 5";

    const ctxAvg = document.getElementById("promedio-reseñas-chart").getContext("2d");
    if (chartAvg) chartAvg.destroy();
    chartAvg = new Chart(ctxAvg, {
      type: "doughnut",
      data: {
        labels: ["Promedio", "Restante"],
        datasets: [{
          data: [promedio, 5 - promedio],
          backgroundColor: [
            getComputedStyle(document.documentElement).getPropertyValue('--chart-color').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--chart-bg').trim()
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => context.label === "Promedio" ? `Promedio: ${promedio.toFixed(2)}/5` : ""
            }
          }
        }
      }
    });

  } catch (err) {
    console.error("Error cargando estadísticas:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadDashboardStats();

  const themeBtn = document.getElementById("theme-toggle");
  const body = document.body;
  const navbar = document.getElementById("navbar");
  const footer = document.querySelector(".main-footer");

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.style.setProperty('--bg-color', '#121212');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
      document.documentElement.style.setProperty('--card-bg', '#1e1e1e');
      document.documentElement.style.setProperty('--list-text-color', '#ffffff');
      document.documentElement.style.setProperty('--chart-color', '#ff851b');
      document.documentElement.style.setProperty('--chart-bg', '#ffe5d1');
      document.documentElement.style.setProperty('--progress-color', '#ff851b');
      document.documentElement.style.setProperty('--badge-bg', '#0d6efd');
      navbar.style.borderBottom = "1px solid #555555";
      footer.style.borderTop = "1px solid #555555";
    } else {
      document.documentElement.style.setProperty('--bg-color', '#ffffff');
      document.documentElement.style.setProperty('--text-color', '#000000');
      document.documentElement.style.setProperty('--card-bg', '#f8f9fa');
      document.documentElement.style.setProperty('--list-text-color', '#000000');
      document.documentElement.style.setProperty('--chart-color', '#ff851b');
      document.documentElement.style.setProperty('--chart-bg', '#ffe5d1');
      document.documentElement.style.setProperty('--progress-color', '#ff6f00');
      document.documentElement.style.setProperty('--badge-bg', '#0d6efd');
      navbar.style.borderBottom = "1px solid #dee2e6";
      footer.style.borderTop = "1px solid #dee2e6";
    }
    loadDashboardStats(); // actualizar charts y listas
  }

  themeBtn.addEventListener("click", () => {
    const isDark = body.getAttribute("data-theme") === "dark";
    if (isDark) {
      body.removeAttribute("data-theme");
      themeBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
      applyTheme(false);
    } else {
      body.setAttribute("data-theme", "dark");
      themeBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
      applyTheme(true);
    }
  });
});
