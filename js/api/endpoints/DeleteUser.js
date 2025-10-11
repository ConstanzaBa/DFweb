// /home1/dragonfilms/public_html/js/api/endpoints/DeleteUser.js
import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';
import { showError } from '../../web/user/ShowError.js';

document.addEventListener("DOMContentLoaded", () => {
  const deleteButton = document.getElementById("deleteAccount");
  if (!deleteButton) return;

  deleteButton.addEventListener("click", async () => {
    const confirmed = confirm("¿Estás seguro de que deseas eliminar tu cuenta?");
    if (!confirmed) return;

    try {
      const response = await fetchConToken(`${API_BASE_URL}/Usuarios/DeleteUser.php`, {
        method: "POST"
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.removeItem('token');
         window.location.replace("/login.html");
      } else {
         showError("accountDeletionError", "warning");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
       showError("accountDeletionError", "warning");
    }
  });
});
