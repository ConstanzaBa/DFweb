const errorTimers = new Map();

export function showError(message) {
  const container = document.getElementById('error-container');
  if (!container) return;

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

  existing.classList.remove('highlight');
  void existing.offsetWidth; 
  existing.classList.add('highlight');

  return;
}

  fetch('./ShowError.html')
    .then(response => response.text())
    .then(template => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(template, 'text/html');
      const errorBar = doc.body.firstElementChild;

      errorBar.querySelector('.error__title').textContent = message;

      errorBar.querySelector('.error__close').addEventListener('click', () => {
        errorBar.remove();
        errorTimers.delete(errorBar);
      });

      const timer = setTimeout(() => {
        errorBar.remove();
        errorTimers.delete(errorBar);
      }, 5000);
      errorTimers.set(errorBar, timer);

      container.appendChild(errorBar);
    })
    .catch(err => {
      console.error('No se pudo cargar el mensaje de error:', err);
    });
}
