// js/api/endpoints/AddUser.js
import { API_BASE_URL } from '../../utils/config.js';
import { getAvatarSeleccionado } from '../../web/user/Avatar.js';

export async function registerUser(formDataObj) {
  try {
    const avatar = getAvatarSeleccionado();

    // Crear FormData
    const body = new FormData();
    for (const key in formDataObj) {
      body.append(key, formDataObj[key]);
    }

    // Agregar avatar correctamente según el tipo
    if (avatar instanceof File) {
      body.append('avatar', avatar); // Subida real
    } else if (typeof avatar === 'string' && avatar !== '') {
      body.append('avatar', avatar); // Ruta por defecto
    } else {
      body.append('avatar', '');
    }

    // Enviar petición
    const response = await fetch(`${API_BASE_URL}/Usuarios/AddUser.php`, {
      method: 'POST',
      body
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error HTTP en registerUser:', response.status, text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error en registerUser:', error);
    return { success: false, error: error.message };
  }
}
