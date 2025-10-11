import { translate } from '../../utils/i18n.js'; 

const errorTimers = new Map();

/**
 * Muestra un mensaje de error/info/success/warning traducido
 * @param {string} message - Clave de traducción o texto directo
 * @param {string} type - 'error' | 'success' | 'warning' | 'info'
 */
export function showError(message, type = 'error') {
  const container = document.getElementById('error-container');
  if (!container) return;

  const translatedMessage = translate(message) || message;

  const existing = Array.from(container.children).find(el =>
    el.classList.contains('error') &&
    el.querySelector('.error__title')?.textContent === translatedMessage
  );

  if (existing) {
    clearTimeout(errorTimers.get(existing));
    const timer = setTimeout(() => {
      existing.remove();
      errorTimers.delete(existing);
    }, 5000);
    errorTimers.set(existing, timer);
    existing.classList.remove('highlight');
    void existing.offsetWidth;
    existing.classList.add('highlight');
    return;
  }

  const errorBar = document.createElement('div');
  errorBar.classList.add('error', type);

  const title = document.createElement('span');
  title.className = 'error__title';
  title.textContent = translatedMessage;
  errorBar.appendChild(title);

  const closeBtn = document.createElement('span');
  closeBtn.className = 'error__close';
  closeBtn.innerHTML = '&#10005;';
  closeBtn.addEventListener('click', () => {
    errorBar.remove();
    errorTimers.delete(errorBar);
  });
  errorBar.appendChild(closeBtn);

  const timer = setTimeout(() => {
    errorBar.remove();
    errorTimers.delete(errorBar);
  }, 5000);
  errorTimers.set(errorBar, timer);

  container.appendChild(errorBar);
}
