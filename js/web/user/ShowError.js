const errorTimers = new Map();

/**
 * Muestra un mensaje de error/info/success/warning
 * @param {string} message - El texto del mensaje
 * @param {string} type - 'error' | 'success' | 'warning' | 'info' (opcional, default: 'error')
 */
export function showError(message, type = 'error') {
  const container = document.getElementById('error-container');
  if (!container) return;

  // Evitar duplicados con mismo mensaje
  const existing = Array.from(container.children).find(el =>
    el.classList.contains('error') &&
    el.querySelector('.error__title')?.textContent === message
  );

  if (existing) {
    clearTimeout(errorTimers.get(existing));
    const timer = setTimeout(() => {
      existing.remove();
      errorTimers.delete(existing);
    }, 5000);
    errorTimers.set(existing, timer);

    // Destello
    existing.classList.remove('highlight');
    void existing.offsetWidth;
    existing.classList.add('highlight');
    return;
  }

  // Crear error manualmente (sin fetch)
  const errorBar = document.createElement('div');
  errorBar.classList.add('error', type);

  const title = document.createElement('span');
  title.className = 'error__title';
  title.textContent = message;
  errorBar.appendChild(title);

  const closeBtn = document.createElement('span');
  closeBtn.className = 'error__close';
  closeBtn.innerHTML = '&#10005;'; // X
  closeBtn.addEventListener('click', () => {
    errorBar.remove();
    errorTimers.delete(errorBar);
  });
  errorBar.appendChild(closeBtn);

  // Temporizador automático
  const timer = setTimeout(() => {
    errorBar.remove();
    errorTimers.delete(errorBar);
  }, 5000);
  errorTimers.set(errorBar, timer);

  // Añadir al contenedor
  container.appendChild(errorBar);
}
