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
      showError("allFieldsRequired", "warning");
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
        showError(`userUpdated: ${result.message || ""}`, "success");

        setTimeout(() => {
          window.location.href = "/user.html";
        }, 1500);
      } else {
        showError(`userUpdateError: ${result.error || ""}`, "error");
      }
    } catch (error) {
      showError("requestProcessingError", "error");
    }
  });
});
