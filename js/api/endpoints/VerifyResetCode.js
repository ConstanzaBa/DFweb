import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('verifyCodeForm');
  const inputs = document.querySelectorAll('.otp-input');
  const timerEl = document.getElementById('timer');
  const resendBtn = document.querySelector('.resendBtn');

  const usuario_id = localStorage.getItem('usuario_id');
  const usuario = localStorage.getItem('usuario'); // nombre de usuario
  let remainingTime = parseInt(localStorage.getItem('seg_restantes')) || 900;
  let timerInterval;

  // ===== Timer =====
  function startTimer(segundos) {
    clearInterval(timerInterval);
    let remaining = segundos;

    if (remaining <= 0) {
      timerEl.textContent = '--:--';
      return;
    }

    timerInterval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerEl.textContent = '--:--';
        showError('El código expiró. Serás redirigido al login.', 'error');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        return;
      }
      const min = String(Math.floor(remaining / 60)).padStart(2, '0');
      const sec = String(remaining % 60).padStart(2, '0');
      timerEl.textContent = `${min}:${sec}`;
      remaining--;
    }, 1000);
  }
  startTimer(remainingTime);

  // ===== Inputs OTP =====
  function getOTPValue() {
    return Array.from(inputs).map(i => i.value.toUpperCase()).join('');
  }

  inputs.forEach((input, idx) => {
    input.addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase();
      if (input.value.length === 1 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });

    input.addEventListener('paste', e => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').toUpperCase().slice(0, inputs.length);
      pasteData.split('').forEach((char, i) => inputs[i].value = char);
      inputs[Math.min(pasteData.length, inputs.length - 1)].focus();
    });
  });

  // ===== Verificar código =====
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const codigo = getOTPValue();
      if (codigo.length < inputs.length) {
        showError('Completa todos los campos', 'warning');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/Password/VerifyResetCode.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ usuario_id, codigo })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('reset_id', data.reset_id);
          localStorage.setItem('seg_restantes', data.seg_restantes);
          startTimer(data.seg_restantes || 900);
          window.location.href = 'updatepass.html';
        } else {
          showError(data.error || 'Código inválido o expirado', 'error');
        }
      } catch {
        showError('Error de conexión', 'error');
      }
    });
  }

  // ===== Reenviar código =====
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
          startTimer(data.seg_restantes || 900);
          inputs.forEach(input => input.value = '');
          inputs[0].focus();
          showError('Nuevo código enviado a tu correo', 'success');
        } else {
          showError(data.error || 'No se pudo reenviar el código', 'error');
        }
      } catch {
        showError('Error de conexión', 'error');
      }
    });
  }
});
