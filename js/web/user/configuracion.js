import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';
import { checkRepetido } from './ValidationMSG.js';
import { showError } from './ShowError.js';
import { getAvatarSeleccionado } from './Avatar.js';

document.addEventListener('DOMContentLoaded', async () => {
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarInput = document.getElementById("file");
  const editAvatarBtn = document.getElementById("editAvatarBtn");

  const usernameInput = document.getElementById("username");
  const msgUsuario = document.getElementById("msgUsuario");
  const profileUsernameDiv = document.getElementById("profile-username");
  const profileEmailDiv = document.getElementById("profile-email");

  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const genderInputs = document.querySelectorAll('input[name="gender"]');
  const updateForm = document.getElementById("updateForm");
  const submitBtn = updateForm.querySelector('button[type="submit"]');

  const reviewsDiv = document.getElementById('profile-reviews');
  const favoritesDiv = document.getElementById('profile-favorites');

  let initialData = {};
  let isCustomAvatar = false;

  // --- Cargar datos del usuario ---
  try {
    const response = await fetchConToken('/Usuarios/GetUserById.php');
    if (!response.ok) throw new Error("No se pudo cargar el usuario");
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    initialData = { ...data };

    // Avatar
    let avatarUrl = data.avatar || 'assets/avatars/default-avatar.png';
    if (!avatarUrl.startsWith("http")) {
      if (!avatarUrl.startsWith("uploads/") && !avatarUrl.startsWith("assets/")) {
        avatarUrl = `assets/avatars/${avatarUrl}`;
      }
      avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
    }
    avatarPreview.src = avatarUrl;

    isCustomAvatar = data.avatar?.startsWith("uploads/");

    // Username y género
    usernameInput.value = data.usuario || "";
    profileUsernameDiv.textContent = data.usuario || "";
    profileEmailDiv.textContent = data.email || "No registrado";

    const genderRadio = document.querySelector(`input[name="gender"][value="${data.genero}"]`);
    if (genderRadio) genderRadio.checked = true;

    // Reviews y favoritos
    if (reviewsDiv) reviewsDiv.textContent = data.reviews || '0';
    if (favoritesDiv) favoritesDiv.textContent = data.favorites || '0';
  } catch (err) {
    console.error("Error cargando usuario:", err);
    alert("Error al cargar datos. Redirigiendo al login...");
    setTimeout(() => window.location.href = "login.html", 2000);
  }

  // --- Avatar ---
  editAvatarBtn.addEventListener("click", () => avatarInput.click());

  avatarInput.addEventListener("change", () => {
    if (avatarInput.files[0]) {
      avatarPreview.src = URL.createObjectURL(avatarInput.files[0]);
      isCustomAvatar = true;
    }
    checkChanges();
  });

  function updateAvatarByGender() {
    if (isCustomAvatar) return;
    const gender = Array.from(genderInputs).find(i => i.checked)?.value;
    const defaultAvatar = gender === "Femenino"
      ? 'assets/avatars/female-default.png'
      : 'assets/avatars/male-default.png';
    avatarPreview.src = `${API_BASE_URL}/${defaultAvatar}`;
    avatarInput.value = '';
    avatarInput.dataset.defaultAvatar = defaultAvatar;
  }

  genderInputs.forEach(i => i.addEventListener("change", () => {
    updateAvatarByGender();
    checkChanges();
  }));

  // --- Debounce username ---
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const checkUsernameInput = debounce(async () => {
    const nuevoUsuario = usernameInput.value.trim();
    if (!nuevoUsuario || nuevoUsuario === initialData.usuario) {
      msgUsuario.textContent = "";
    } else {
      const disponible = await checkRepetido("usuario", nuevoUsuario);
      msgUsuario.textContent = disponible ? "Nombre de usuario disponible" : "Nombre de usuario no disponible";
      msgUsuario.style.color = disponible ? "green" : "red";
    }
    checkChanges();
  }, 500);

  usernameInput.addEventListener("input", checkUsernameInput);

  // --- Activar/desactivar botón submit ---
  function checkChanges() {
    const usernameChanged = usernameInput.value.trim() !== initialData.usuario;
    const genderChanged = Array.from(genderInputs).find(i => i.checked)?.value !== initialData.genero;
    const passwordFilled = newPasswordInput.value.trim() !== "";
    const avatarChanged = !!getAvatarSeleccionado();
    submitBtn.disabled = !(usernameChanged || genderChanged || passwordFilled || avatarChanged);
  }

  [usernameInput, newPasswordInput, confirmPasswordInput].forEach(el => el.addEventListener("input", checkChanges));
  genderInputs.forEach(i => i.addEventListener("change", checkChanges));
  checkChanges();

  // --- Actualizar usuario ---
  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const genero = Array.from(genderInputs).find(i => i.checked)?.value;
    const avatar = getAvatarSeleccionado();

    if (!username) return showError("Nombre de usuario obligatorio");
    if (password && password !== confirmPassword) return showError("Las contraseñas no coinciden");
    if (username !== initialData.usuario && !(await checkRepetido("usuario", username))) {
      return showError("Nombre de usuario ya existe");
    }

    const formData = new FormData();
    if (username !== initialData.usuario) formData.append("username", username);
    if (genero !== initialData.genero) formData.append("genero", genero);
    if (password) formData.append("password", password);
    if (avatar) formData.append("avatar", avatar instanceof File ? avatar : avatar);

    if ([...formData.keys()].length === 0) return showError("No se han realizado cambios");

    try {
      const response = await fetchConToken('/Usuarios/UpdateUser.php', {
        method: "POST",
        body: formData,
        credentials: 'include'
      });  
      const result = await response.json();
      if (response.ok) {
        showError(result.message || "Usuario actualizado correctamente", "success");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showError(result.error || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      showError("Error en la solicitud");
    }
  });

  // --- Cancelar ---
  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) cancelBtn.addEventListener("click", () => window.location.reload());


  // --- MODAL ELIMINAR CUENTA ---
  const deleteBtn = document.getElementById('deleteAccountBtn');
  const modal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');

  // Abrir modal
  deleteBtn.addEventListener('click', () => {
    modal.classList.add('show');
  });

  // Cerrar modal al cancelar
  cancelDeleteBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Cerrar modal si se hace click fuera de la card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });

  // Confirmar eliminación
  confirmDeleteBtn.addEventListener('click', async () => {
    try {
      const response = await fetchConToken('/Usuarios/DeleteUser.php', {
        method: 'POST',
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Cuenta eliminada correctamente");
        window.location.href = 'login.html';
      } else {
        alert(result.error || "No se pudo eliminar la cuenta");
      }
    } catch (err) {
      console.error("Error al eliminar la cuenta:", err);
      alert("Error en la solicitud");
    } finally {
      modal.classList.remove('show');
    }
  });
});
