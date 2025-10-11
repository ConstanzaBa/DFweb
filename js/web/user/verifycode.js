import { showError } from './ShowError.js';
import { translate } from '../../utils/i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  const otpInputs = document.querySelectorAll('.otp-input');
  const timerDisplay = document.getElementById('timer'); // Mostrar tiempo restante
  const form = document.getElementById('verifyCodeForm');

  const initialTime = parseInt(localStorage.getItem('seg_restantes')) || 900;
  let remainingTime = initialTime;

  function updateTimer() {
    const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
    const seconds = String(remainingTime % 60).padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;

    if (remainingTime <= 0) {
  clearInterval(timerInterval);
  showError(translate("codeExpired"), "warning");
  setTimeout(() => window.location.href = "login.html", 3000);
}
    remainingTime--;
  }

  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // Mostrar el primer valor de inmediato

  // Manejo de inputs OTP
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
      if (input.value.length === input.maxLength && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', e => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').toUpperCase().slice(0, otpInputs.length);
      pasteData.split('').forEach((char, i) => otpInputs[i].value = char);
      otpInputs[Math.min(pasteData.length, otpInputs.length - 1)].focus();
    });
  });
});
