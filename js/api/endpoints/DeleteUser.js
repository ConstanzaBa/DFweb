import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';

document.addEventListener("DOMContentLoaded", () => {
  const deleteButton = document.getElementById("deleteAccount");

  if (!deleteButton) return;

  deleteButton.addEventListener("click", async () => {
    if (confirm("¿Estás seguro de que deseas eliminar tu cuenta?")) {
      try {
        const response = await fetchConToken('/Usuarios/DeleteUser.php', {
          method: "DELETE",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          alert("Cuenta eliminada");
          localStorage.removeItem('token');
          window.location.href = "https://dragonfilms.space/login.html";
        } else {
          alert(data.error || "Error al eliminar cuenta");
        }
      } catch (err) {
        console.error("Error en la solicitud:", err);
        alert("Error al eliminar cuenta");
      }
    }
  });
});
