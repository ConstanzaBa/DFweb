import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

const resendBtn = document.querySelector('.resendBtn');
const usuario = localStorage.getItem('usuario'); // nombre de usuario, no id

if (resendBtn) {
  resendBtn.addEventListener('click', async () => {
    if (!usuario) {
      showError("userUnavailable", "error");
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
        showError("newCodeSent", "success");

      } else {
        showError(translate(data.error) || translate('resendCodeError'), 'error');

      }
    } catch (err) {
      showError("connectionError", "error");
    }
  });
}
