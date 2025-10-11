import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

const form = document.getElementById('forgotForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    if (!usuario) {
        showError("enterUsername", "warning");
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
        localStorage.setItem('usuario', usuario); 
        localStorage.setItem('seg_restantes', data.seg_restantes);
        showError("codeSentCheckEmail", "success");
        setTimeout(() => {
          window.location.href = 'verifycode.html';
        }, 1500);
      } else {
        showError("codeSendError", "error");
      }

    } catch (err) {
      showError("connectionError", "error");
    }
  });
}
