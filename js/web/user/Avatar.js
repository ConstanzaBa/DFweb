// js/web/user/Avatar.js
let avatarSeleccionado = null;

function updateSubmitButton() {
  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) {
    console.warn("⚠️ No se encontró el botón submit");
    return;
  }
  const fileInput = document.getElementById('file');
  submitBtn.disabled = !avatarSeleccionado && !fileInput?.dataset.defaultAvatar;

  console.log("🔄 updateSubmitButton()");
  console.log("   ➤ Avatar seleccionado:", avatarSeleccionado);
  console.log("   ➤ Dataset defaultAvatar:", fileInput?.dataset.defaultAvatar);
  console.log("   ➤ Botón submit habilitado:", !submitBtn.disabled);
}

function handleFileInput(input) {
  console.log("📂 handleFileInput() ejecutado");
  const fileNameText = document.getElementById('file-name');
  const file = input.files[0];

  if (file) {
    console.log("   ➤ Archivo seleccionado:", file.name, file);
    avatarSeleccionado = file;
    input.dataset.defaultAvatar = '';
    fileNameText.textContent = file.name;
  } else {
    console.log("   ➤ No se seleccionó archivo");
    avatarSeleccionado = null;
    fileNameText.textContent = "Ningún archivo seleccionado";
  }
  updateSubmitButton();
}

function handleFileDrop(event) {
  console.log("📥 handleFileDrop() ejecutado");
  event.preventDefault();
  const file = event.dataTransfer.files[0];

  if (file) {
    console.log("   ➤ Archivo soltado:", file.name, file);
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
  const valor = avatarSeleccionado instanceof File
    ? avatarSeleccionado
    : document.getElementById('file')?.dataset.defaultAvatar || null;

  console.log("📌 getAvatarSeleccionado() =>", valor);
  return valor;
}

function initAvatarModule() {
  console.log("🚀 initAvatarModule() inicializado");
  const fileInput = document.getElementById('file');
  const clearBtn = document.getElementById('clear-file-btn');
  const chooseLaterBtn = document.getElementById('choose-later');
  const dropZone = document.querySelector('.upload-container .header');

  if (fileInput) {
    console.log("✔️ fileInput encontrado");
    fileInput.addEventListener('change', () => handleFileInput(fileInput));
  } else {
    console.warn("⚠️ No se encontró fileInput");
  }

  if (clearBtn && fileInput) {
    console.log("✔️ clearBtn encontrado");
    clearBtn.addEventListener('click', () => {
      console.log("🗑️ Botón 'clear' clicado");
      fileInput.value = '';
      fileInput.dataset.defaultAvatar = '';
      avatarSeleccionado = null;
      document.getElementById('file-name').textContent = "Ningún archivo seleccionado";
      updateSubmitButton();
    });
  }

  if (chooseLaterBtn && fileInput) {
    console.log("✔️ chooseLaterBtn encontrado");
    chooseLaterBtn.addEventListener('click', (e) => {
      console.log("🕒 Botón 'choose later' clicado");
      e.preventDefault();
      const genero = document.querySelector('input[name="gender"]:checked')?.value;
      console.log("   ➤ Género detectado:", genero);
      const defaultAvatarPath = genero === "Femenino"
        ? 'assets/avatars/female-default.png'
        : 'assets/avatars/male-default.png';
      fileInput.value = '';
      fileInput.dataset.defaultAvatar = defaultAvatarPath;
      avatarSeleccionado = defaultAvatarPath;
      document.getElementById('file-name').textContent = "Avatar por defecto asignado";
      console.log("   ➤ Avatar por defecto asignado:", defaultAvatarPath);
      updateSubmitButton();
    });
  }

  if (dropZone && fileInput) {
    console.log("✔️ dropZone encontrada");
    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    dropZone.addEventListener('drop', handleFileDrop);
    dropZone.addEventListener('click', () => {
      console.log("🖱️ DropZone clicada => disparando input file");
      fileInput.click();
    });
  }

  updateSubmitButton();
}

document.addEventListener('DOMContentLoaded', initAvatarModule);

export { handleFileDrop, handleFileInput, getAvatarSeleccionado };
