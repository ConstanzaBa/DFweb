import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';

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
      alert("Todos los campos son obligatorios");
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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Usuario actualizado correctamente");
        window.location.href = "https://dragonfilms.space/user.html";
      } else {
        alert(result.error || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      alert("Error al procesar la solicitud");
    }
  });
});
