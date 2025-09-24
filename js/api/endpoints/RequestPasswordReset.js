import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

const form = document.getElementById('forgotForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    if (!usuario) {
      showError('Ingresa tu usuario', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/Password/RequestPasswordReset.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usuario })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('usuario_id', data.usuario_id);
        localStorage.setItem('usuario', usuario); // guardamos el nombre de usuario
        localStorage.setItem('seg_restantes', data.seg_restantes);
        showError('C¨®digo enviado correctamente. Revisa tu correo.', 'success');
        setTimeout(() => {
          window.location.href = 'verifycode.html';
        }, 1500);
      } else {
        showError(data.error || 'No se pudo enviar el c¨®digo', 'error');
      }

    } catch (err) {
      showError('Error de conexi¨®n', 'error');
    }
  });
}
