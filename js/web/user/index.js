import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn("No hay token en localStorage, usuario no autenticado.");
    return;
  }

  try {
    const response = await fetchConToken('/Usuarios/GetUserById.php');

    if (!response || !response.ok) {
      throw new Error('Token inválido o expirado');
    }

    const userData = await response.json();

    if (!userData || !userData.usuario) {
      throw new Error('Datos de usuario no válidos');
    }

    const avatarImg = document.getElementById('avatarImg');
    if (avatarImg) {
      let avatarUrl = userData.avatar;

      if (!avatarUrl || avatarUrl === '') {
        // Avatar por defecto según género (si lo tenés en userData)
        const genero = userData.genero || 'Masculino';
        avatarUrl = genero === 'Femenino'
          ? `${API_BASE_URL}/assets/avatars/female-default.png`
          : `${API_BASE_URL}/assets/avatars/male-default.png`;
      } else if (!avatarUrl.startsWith('http')) {
        // Avatar subido por el usuario
        avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
      }

      avatarImg.src = avatarUrl;
    }

    const usernameDiv = document.getElementById('username');
    if (usernameDiv) {
      usernameDiv.textContent = userData.usuario;
    }

  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
  }
});
