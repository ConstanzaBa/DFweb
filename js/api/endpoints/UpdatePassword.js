import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('updateForm');
  if (!form) return;

  const usuario_id = localStorage.getItem('usuario_id');
  const reset_id = localStorage.getItem('reset_id');

  if (!usuario_id || !reset_id) {
    showError('No se encontró información de sesión. Vuelve a solicitar el código.');
    return;
  }

  form.querySelector('[name="usuario_id"]').value = usuario_id;
  form.querySelector('[name="reset_id"]').value = reset_id;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      showError("passwordsDoNotMatch", "error");

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
        showError("passwordUpdated", "success");

        localStorage.removeItem('usuario_id');
        localStorage.removeItem('reset_id');
        window.location.href = 'login.html';
      } else {
        showError(translate(data.error) || translate('passwordUpdateError'), 'error');
      }

    } catch (err) {
      showError(`${translate("connectionError")} ${err.message}`, "error");
      console.error(err);
    }
  });
});
