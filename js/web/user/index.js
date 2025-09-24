import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';
import { loadUserFavorites } from './loadUserFavorites.js';
import { loadUserReviews } from './loadUserReviews.js';
import { updateTranslations } from '../../utils/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
   return;
  }

  try {
    const response = await fetchConToken('/Usuarios/GetUserById.php');
    if (!response || !response.ok) throw new Error('Token inválido o expirado');

    const userData = await response.json();
    if (!userData || !userData.usuario) throw new Error('Datos de usuario no válidos');

    // Avatar
    const avatarImg = document.getElementById('profile-avatarImg');
    if (avatarImg) {
      let avatarUrl = userData.avatar;
      if (!avatarUrl || avatarUrl === '') {
        const genero = userData.genero || 'Masculino';
        avatarUrl = genero === 'Femenino'
          ? `${API_BASE_URL}/assets/avatars/female-default.png`
          : `${API_BASE_URL}/assets/avatars/male-default.png`;
      } else if (!avatarUrl.startsWith('http')) {
        avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
      }
      avatarImg.src = avatarUrl;
    }

    // Username
    const usernameDiv = document.getElementById('profile-username');
    if (usernameDiv) usernameDiv.textContent = userData.usuario;

    // Actualizar contadores de "cargando..."
    const reviewsCount = document.getElementById('profile-reviews');
    const favoritesCount = document.getElementById('profile-favorites');
    if (reviewsCount) reviewsCount.textContent = '…';
    if (favoritesCount) favoritesCount.textContent = '…';

    // Cargar datos de reseñas y favoritos
    await Promise.all([
      loadUserFavorites(token),
      loadUserReviews(token)
    ]);

    // Update translations after loading user data
    updateTranslations();

  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');

    // Poner contadores en 0 por seguridad
    const reviewsCount = document.getElementById('profile-reviews');
    const favoritesCount = document.getElementById('profile-favorites');
    if (reviewsCount) reviewsCount.textContent = 0;
    if (favoritesCount) favoritesCount.textContent = 0;
  }
});
