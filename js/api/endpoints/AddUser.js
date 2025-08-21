// js/api/endpoints/AddUser.js
import { API_BASE_URL } from '../../utils/config.js';
import { getAvatarSeleccionado } from '../../web/user/Avatar.js';

export async function registerUser(formDataObj) {
  try {
    console.log('🚀 registerUser() iniciado');
    console.log('➤ Datos recibidos en formDataObj:', formDataObj);

    const avatar = getAvatarSeleccionado();
    console.log('📌 getAvatarSeleccionado() =>', avatar);

    // Crear FormData
    const body = new FormData();
    for (const key in formDataObj) {
      body.append(key, formDataObj[key]);
      console.log(`➤ Campo agregado a FormData: ${key} = ${formDataObj[key]}`);
    }

    // Agregar avatar correctamente según el tipo
    if (avatar instanceof File) {
      body.append('avatar', avatar); // Subida real
      console.log('➤ Avatar tipo File agregado a FormData');
    } else if (typeof avatar === 'string' && avatar !== '') {
      body.append('avatar', avatar); // Ruta por defecto
      console.log('➤ Avatar por defecto agregado a FormData como string');
    } else {
      console.log('⚠️ No hay avatar seleccionado, se enviará vacío');
      body.append('avatar', '');
    }

    // Enviar petición
    const response = await fetch(`${API_BASE_URL}/Usuarios/AddUser.php`, {
      method: 'POST',
      body
    });

    console.log('🌍 Enviando petición a:', `${API_BASE_URL}/Usuarios/AddUser.php`);
    console.log('➤ Body FormData preparado');

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error HTTP en registerUser:', response.status, text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log('📡 Respuesta recibida:', data);

    return { success: true, data };

  } catch (error) {
    console.error('🔥 Error en registerUser:', error);
    return { success: false, error: error.message };
  }
}
