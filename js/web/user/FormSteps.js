import { registerUser } from '../../api/endpoints/AddUser.js';
import { showError } from './ShowError.js';
import { checkRepetido } from './ValidationMSG.js';

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.step-form');
  let currentStep = 0;

  function showForm(index) {
    forms.forEach((form, i) => form.classList.toggle('active-form', i === index));
    currentStep = index;
  }

  showForm(0);

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const usernameInput = document.getElementById('username');
  const genderInputs = document.querySelectorAll('input[name="gender"]');

  const msgUsuario = document.getElementById('msgUsuario');
  const msgEmail = document.getElementById('msgEmail');

  // ------------------------
  // Función debounce
  // ------------------------
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ------------------------
  // Validación en tiempo real
  // ------------------------
  const checkUsername = debounce(async () => {
    if (!usernameInput.value.trim()) {
      msgUsuario.textContent = '';
      return;
    }
    const disponible = await checkRepetido('usuario', usernameInput.value);
    if (disponible) {
      msgUsuario.textContent = 'Usuario disponible';
      msgUsuario.style.color = 'green';
    } else {
      msgUsuario.textContent = 'Usuario ya existe';
      msgUsuario.style.color = 'red';
    }
  }, 500);

  const checkEmail = debounce(async () => {
    if (!emailInput.value.trim()) {
      msgEmail.textContent = '';
      return;
    }
    const disponible = await checkRepetido('email', emailInput.value);
    if (disponible) {
      msgEmail.textContent = 'Email disponible';
      msgEmail.style.color = 'green';
    } else {
      msgEmail.textContent = 'Email ya está registrado';
      msgEmail.style.color = 'red';
    }
  }, 500);

  usernameInput.addEventListener('input', checkUsername);
  emailInput.addEventListener('input', checkEmail);

  // ------------------------
  // Paso 1 -> Validaciones antes de pasar al siguiente paso
  // ------------------------
  document.getElementById('next1').addEventListener('click', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const username = usernameInput.value.trim();
    const gender = Array.from(genderInputs).find(i => i.checked)?.value;

    const errors = [];
    const validarEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) errors.push("El email es requerido");
    else if (!validarEmail(email)) errors.push("El email no es válido");

    if (!password) errors.push("Debes ingresar una contraseña");
    else {
      if (password.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres");
      if (!/[A-Z]/.test(password)) errors.push("La contraseña debe tener al menos una letra mayúscula");
      if (/[^a-zA-Z0-9]/.test(password)) errors.push("La contraseña no debe contener caracteres especiales");
    }

    if (password && password !== confirmPassword) errors.push("Las contraseñas no coinciden");
    if (!username) errors.push("El nombre de usuario es requerido");
    if (!gender) errors.push("Selecciona un género");

    if (username && !(await checkRepetido('usuario', username))) errors.push("Usuario ya existe");
    if (email && !(await checkRepetido('email', email))) errors.push("Email ya está registrado");

    if (errors.length > 0) {
      errors.forEach(err => showError(err));
      return;
    }

    showForm(1);
  });

  // ------------------------
  // Botón de volver
  // ------------------------
  document.getElementById('back3').addEventListener('click', () => showForm(0));

  // ------------------------
  // Paso 2 -> Submit final
  // ------------------------
  document.getElementById('form2').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const genero = Array.from(genderInputs).find(i => i.checked)?.value;

    const result = await registerUser({ username, password, email, genero });


    if (result.success) {
       window.location.href = "/login.html";
    } else {
      showError(result.error || 'Ocurrió un error inesperado');
    }
  });
});
