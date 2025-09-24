import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

document.addEventListener("DOMContentLoaded", () => {
  const updateForm = document.getElementById("updateForm");

  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const avatar = document.getElementById("avatar").value.trim();

    const genero = genderInput?.value;

    if (!username || !password || !genero || !avatar) {
      showError("Todos los campos son obligatorios", "warning");
      return;
    }

    const body = new URLSearchParams({
      username,
      password,
      genero,
      avatar
    });

    try {
      const response = await fetchConToken('/Usuarios/UpdateUser.php', {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        showError(result.message || "Usuario actualizado correctamente", "success");
        setTimeout(() => {
          window.location.href = "/user.html";
        }, 1500); // Pequeè´–o retraso para que se vea la alerta
      } else {
        showError(result.error || "Error al actualizar usuario", "error");
      }
    } catch (error) {
      showError("Error al procesar la solicitud", "error");
    }
  });
});
