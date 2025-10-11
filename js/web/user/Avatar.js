// js/web/user/Avatar.js
let avatarSeleccionado = null;

function updateSubmitButton() {
  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) {
    console.warn("No se encontró el botón submit");
    return;
  }
  const fileInput = document.getElementById('file');
  submitBtn.disabled = !avatarSeleccionado && !fileInput?.dataset.defaultAvatar;
}

function handleFileInput(input) {
  const fileNameText = document.getElementById('file-name');
  const file = input.files[0];

  if (file) {
    avatarSeleccionado = file;
    input.dataset.defaultAvatar = '';
    fileNameText.textContent = file.name;
  } else {
    avatarSeleccionado = null;
    fileNameText.textContent = "Ningún archivo seleccionado";
  }
  updateSubmitButton();
}

function handleFileDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];

  if (file) {
    const fileInput = document.getElementById('file');
    fileInput.files = event.dataTransfer.files;
    fileInput.dataset.defaultAvatar = '';
    avatarSeleccionado = file;
    document.getElementById('file-name').textContent = file.name;
    updateSubmitButton();
  } else {
    console.warn("⚠️ No se detectó archivo en el drop");
  }
}

function getAvatarSeleccionado() {
  return avatarSeleccionado instanceof File
    ? avatarSeleccionado
    : document.getElementById('file')?.dataset.defaultAvatar || null;
}

function initAvatarModule() {
  const fileInput = document.getElementById('file');
  const clearBtn = document.getElementById('clear-file-btn');
  const chooseLaterBtn = document.getElementById('choose-later');
  const dropZone = document.querySelector('.upload-container .header');

  if (fileInput) {
    fileInput.addEventListener('change', () => handleFileInput(fileInput));
  } else {
    console.warn("⚠️ No se encontró fileInput");
  }

  if (clearBtn && fileInput) {
    clearBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.dataset.defaultAvatar = '';
      avatarSeleccionado = null;
      document.getElementById('file-name').textContent = "Ningún archivo seleccionado";
      updateSubmitButton();
    });
  }

  if (chooseLaterBtn && fileInput) {
    chooseLaterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const genero = document.querySelector('input[name="gender"]:checked')?.value;
      const defaultAvatarPath = genero === "Femenino"
        ? 'assets/avatars/female-default.png'
        : 'assets/avatars/male-default.png';
      fileInput.value = '';
      fileInput.dataset.defaultAvatar = defaultAvatarPath;
      avatarSeleccionado = defaultAvatarPath;
      document.getElementById('file-name').textContent = "Avatar por defecto asignado";
      updateSubmitButton();
    });
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    dropZone.addEventListener('drop', handleFileDrop);
    dropZone.addEventListener('click', () => fileInput.click());
  }

  updateSubmitButton();
}

document.addEventListener('DOMContentLoaded', initAvatarModule);

export { handleFileDrop, handleFileInput, getAvatarSeleccionado };
