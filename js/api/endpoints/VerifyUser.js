import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const username = formData.get('username');
  const password = formData.get('password');

  fetch(`${API_BASE_URL}/Usuarios/VerifyUser.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include',
    body: new URLSearchParams({ username, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username || username);
        if (data.avatar) localStorage.setItem('avatar', data.avatar);
       window.location.href = "/user.html";
      } else {
        showError("loginError", "error");
      }
    })
    .catch(() => {
        showError("loginProblem", "error");
    });
});
