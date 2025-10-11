import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetchConToken('/Usuarios/GetUserById.php');

    if (!response.ok) {
      throw new Error('Token inválido o expirado');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

   let avatarUrl = data.avatar || 'assets/avatars/default-avatar.png';
if (!avatarUrl.startsWith('http')) {
  if (!avatarUrl.startsWith('uploads/') && !avatarUrl.startsWith('assets/')) {
    avatarUrl = `assets/avatars/${avatarUrl}`;
  }
  avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
}


    localStorage.setItem('username', data.usuario);
    localStorage.setItem('avatar', avatarUrl);

    const avatarImg = document.getElementById('profile-avatarImg');
    if (avatarImg) avatarImg.src = avatarUrl;

    const usernameDiv = document.getElementById('profile-username');
    if (usernameDiv) usernameDiv.textContent = data.usuario;

    const reviewsDiv = document.getElementById('profile-reviews');
    if (reviewsDiv) reviewsDiv.textContent = data.reviews || '0';

    const favoritesDiv = document.getElementById('profile-favorites');
    if (favoritesDiv) favoritesDiv.textContent = data.favorites || '0';

  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');

    setTimeout(() => {
      window.location.href = "/login.html";
    }, 2000);
  }
});
