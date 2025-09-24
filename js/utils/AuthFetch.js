import { API_BASE_URL } from '../utils/config.js';

document.addEventListener("DOMContentLoaded", () => {
  const deleteButton = document.getElementById("deleteAccount");

  if (!deleteButton) return;

  deleteButton.addEventListener("click", async () => {
    if (confirm("¿Estás seguro de que deseas eliminar tu cuenta?")) {
      try {
        const response = await fetchConToken('/Usuarios/DeleteUser.php', {
          method: "DELETE",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          alert("Cuenta eliminada");
          localStorage.removeItem('token');
            window.location.href = "/login.html";
        } else {
          alert(data.error || "Error al eliminar cuenta");
        }
      } catch (err) {
        console.error("Error en la solicitud:", err);
        alert("Error al eliminar cuenta");
      }
    }
  });
});


export async function fetchConToken(url, options = {}) {
  let token = localStorage.getItem('token');
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : API_BASE_URL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');


  try {
    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers
    });

    if (response.status !== 401) return response;

    // Renovar token si 401
    const newToken = await renovarAccessToken();

    if (!newToken) throw new Error('No se pudo renovar el token');

    localStorage.setItem('token', newToken);
    headers['Authorization'] = `Bearer ${newToken}`;

    return await fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers
    });
  } catch (error) {
    console.error('Error en fetchConToken:', error);
   localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    window.location.href = "/login.html";
  }
}

async function renovarAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/Usuarios/refresh.php`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}
