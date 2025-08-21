import { API_BASE_URL } from '../../utils/config.js';

export async function checkRepetido(tipo, valor) {
  if (valor.trim() === '') return;

  const formData = new FormData();

  if (tipo === 'usuario') {
    formData.append('usuario', valor);
    formData.append('email', '');
  } else if (tipo === 'email') {
    formData.append('usuario', '');
    formData.append('email', valor);
  } else {
    throw new Error('Tipo inválido');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Usuarios/checkRepetidos.php`, {
      method: "POST",
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Error en respuesta API:', response.statusText);
      return false;
    }

    const result = await response.json();

    if (!result.success) {
      console.error('Error API:', result.error);
      return false;
    }

    if (tipo === 'usuario') {
      return parseInt(result.data.usuarioExiste) === 0;
    } else if (tipo === 'email') {
      return parseInt(result.data.emailExiste) === 0;
    }
  } catch (error) {
    console.error('Error al consultar API:', error);
    return false;
  }
}
