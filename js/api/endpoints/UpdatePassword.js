import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('updateForm');
  if (!form) return;

  // Leer usuario_id y reset_id desde localStorage
  const usuario_id = localStorage.getItem('usuario_id');
  const reset_id = localStorage.getItem('reset_id');

  if (!usuario_id || !reset_id) {
    showError('No se encontró información de sesión. Vuelve a solicitar el código.');
    return;
  }

  // Asignar valores a inputs ocultos
  form.querySelector('[name="usuario_id"]').value = usuario_id;
  form.querySelector('[name="reset_id"]').value = reset_id;

  // Manejar submit
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/Password/UpdatePassword.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usuario_id, reset_id, password })
      });

      const data = await res.json();

      if (data.success) {
        alert('Contraseña actualizada correctamente');
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('reset_id');
        window.location.href = 'login.html';
      } else {
        showError(data.error || 'Error al actualizar la contraseña');
      }

    } catch (err) {
      showError('Error de conexión');
      console.error(err);
    }
  });
});
