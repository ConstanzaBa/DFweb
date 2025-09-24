import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

const resendBtn = document.querySelector('.resendBtn');
const usuario = localStorage.getItem('usuario'); // nombre de usuario, no id

if (resendBtn) {
  resendBtn.addEventListener('click', async () => {
    if (!usuario) {
      showError('Usuario no disponible', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/Password/ResendPasswordReset.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usuario })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('seg_restantes', data.seg_restantes);
        showError('Nuevo código enviado a tu correo', 'success');
      } else {
        showError(data.error || 'No se pudo reenviar el código', 'error');
      }
    } catch (err) {
      showError('Error de conexión', 'error');
    }
  });
}
