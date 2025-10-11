// /js/web/user/configuracion.js
import { fetchConToken } from '../../utils/AuthFetch.js';
import { API_BASE_URL } from '../../utils/config.js';
import { checkRepetido } from './ValidationMSG.js';
import { showError } from './ShowError.js';
import { getAvatarSeleccionado } from './Avatar.js';
import { translate } from '../../utils/i18n.js';

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
  const submitBtn = updateForm?.querySelector('button[type="submit"]');

  const reviewsDiv = document.getElementById('profile-reviews');
  const favoritesDiv = document.getElementById('profile-favorites');

  let initialData = {};
  let isCustomAvatar = false;

  // ================== CARGAR DATOS DEL USUARIO ==================
  try {
    const response = await fetchConToken('/Usuarios/GetUserById.php');
    if (!response.ok) throw new Error("userLoadError");
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    initialData = { ...data };

    // --- Avatar ---
    let avatarUrl = data.avatar || 'assets/avatars/default-avatar.png';
    if (!avatarUrl.startsWith("http")) {
      if (!avatarUrl.startsWith("uploads/") && !avatarUrl.startsWith("assets/")) {
        avatarUrl = `assets/avatars/${avatarUrl}`;
      }
      avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
    }
    avatarPreview.src = avatarUrl;
    isCustomAvatar = data.avatar?.startsWith("uploads/");

    // --- Datos de perfil ---
    usernameInput.value = data.usuario || "";
    profileUsernameDiv.textContent = data.usuario || "";
    profileEmailDiv.textContent = data.email || translate("noEmailAvailable");

    const genderRadio = document.querySelector(`input[name="gender"][value="${data.genero}"]`);
    if (genderRadio) genderRadio.checked = true;

    if (reviewsDiv) reviewsDiv.textContent = data.reviews || '0';
    if (favoritesDiv) favoritesDiv.textContent = data.favorites || '0';
  } catch (err) {
    console.error("Error cargando usuario:", err);
    showError("userLoadError", "error");
    setTimeout(() => window.location.href = "login.html", 2000);
    return;
  }

  // ================== AVATAR ==================
  editAvatarBtn?.addEventListener("click", () => avatarInput.click());

  avatarInput?.addEventListener("change", () => {
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

  // ================== USERNAME DEBOUNCE ==================
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
      msgUsuario.textContent = disponible
        ? translate("usernameAvailable")
        : translate("usernameNotAvailable");
      msgUsuario.style.color = disponible ? "green" : "red";
    }
    checkChanges();
  }, 500);

  usernameInput.addEventListener("input", checkUsernameInput);

  // ================== VERIFICAR CAMBIOS ==================
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

// ================== ACTUALIZAR USUARIO ==================
updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  const genero = Array.from(genderInputs).find(i => i.checked)?.value;
  const avatar = getAvatarSeleccionado();

  // Validaciones locales
  if (!username) return showError("usernameRequired", "error");
  if (password && password !== confirmPassword) return showError("passwordMismatch", "error");
  if (username !== initialData.usuario && !(await checkRepetido("usuario", username))) {
    return showError("usernameExists", "error");
  }

  const formData = new FormData();
  if (username !== initialData.usuario) formData.append("username", username);
  if (genero !== initialData.genero) formData.append("genero", genero);
  if (password) formData.append("password", password);
  if (avatar) formData.append("avatar", avatar instanceof File ? avatar : avatar);

  if ([...formData.keys()].length === 0) return showError("noChangesMade", "warning");

  try {
    const response = await fetchConToken('/Usuarios/UpdateUser.php', {
      method: "POST",
      body: formData,
      credentials: 'include'
    });
    
    const result = await response.json();

    if (response.ok && !result.error) {
      showError("userUpdated", "success"); 
      setTimeout(() => window.location.reload(), 1000);
    } else {
      // mapear posibles errores del backend a claves
      const backendErrorMap = {
        "El nombre de usuario ya está en uso": "usernameExists",
        "Error al actualizar usuario": "userUpdateError",
        "No se han realizado cambios": "noChangesMade"
      };
      const key = backendErrorMap[result.error] || "userUpdateError";
      showError(key, "error");
    }
  } catch (error) {
    console.error("Error al actualizar:", error);
    showError("requestError", "error");
  }
});



  // ================== CANCELAR ==================
  document.getElementById("cancelBtn")?.addEventListener("click", () => window.location.reload());

  // ================== ELIMINAR CUENTA ==================
  const deleteBtn = document.getElementById('deleteAccountBtn');
  const modal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');

  deleteBtn?.addEventListener('click', () => modal.classList.add('show'));
  cancelDeleteBtn?.addEventListener('click', () => modal.classList.remove('show'));
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

  confirmDeleteBtn?.addEventListener('click', async () => {
    try {
      const response = await fetchConToken('/Usuarios/DeleteUser.php', {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showError("accountDeleted", "success");
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      } else {
        showError(result.error || "accountDeleteError", "error");
      }
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
      showError("requestError", "error");
    } finally {
      modal.classList.remove('show');
    }
  });
});
