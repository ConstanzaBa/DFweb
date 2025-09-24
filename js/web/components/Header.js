import { API_BASE_URL } from '../../utils/config.js';
import { updateTranslations, setupLanguageToggle } from '../../utils/i18n.js';

// Listen for language changes to update user menu translations
document.addEventListener('languageChanged', () => {
  updateTranslations();
});



document.addEventListener('DOMContentLoaded', () => {

  const headerContainer = document.getElementById('header');

  if (!headerContainer) return;



  fetch('header.html')

    .then(response => {

      if (!response.ok) throw new Error(`Error al cargar el header: ${response.status}`);

      return response.text();

    })

    .then(html => {

      const temp = document.createElement('div');

      temp.innerHTML = html.trim();



      const header = temp.querySelector('.header');

      if (!header) return;



      ['header__entrada', 'header__usuario'].forEach(clase => {

        if (headerContainer.classList.contains(clase)) {

          header.classList.add(clase);

        }

      });



      headerContainer.innerHTML = '';

      headerContainer.appendChild(header);

      // Update translations after header is loaded
      updateTranslations();
      
      // Setup language toggle after header is loaded
      setupLanguageToggle();

      inicializarHeader();

    })

    .catch(error => console.error('Fallo al cargar el header:', error));

});



function inicializarHeader() {

  const token = localStorage.getItem('token');



  const loginIcon = document.getElementById('loginIcon');

  const userMenu = document.getElementById('userMenu');

  const usernameDisplay = document.getElementById('usernameDisplay');

  const avatarImg = document.getElementById('avatarImg');

  const logoutBtn = document.getElementById('logoutBtn');

  const userDropdown = document.getElementById('userDropdown');



  if (!token) {

    loginIcon.style.display = 'inline-block';

    if (userMenu) userMenu.style.display = 'none';

    return;

  }



  fetch(`${API_BASE_URL}/Usuarios/GetUserById.php`, {

    headers: { 'Authorization': `Bearer ${token}` },

    credentials: 'include'

  })

    .then(res => {

      if (!res.ok) throw new Error('Token inválido');

      return res.json();

    })

    .then(data => {

      if (data.error) {

        localStorage.removeItem('token');

        location.reload();

        return;

      }



      loginIcon.style.display = 'none';

      if(userMenu) userMenu.style.display = 'block';



      usernameDisplay.textContent = data.usuario;



     let avatarUrl = data.avatar || 'assets/avatars/default-avatar.png';
if (!avatarUrl.startsWith('http')) {
  if (!avatarUrl.startsWith('uploads/') && !avatarUrl.startsWith('assets/')) {
    avatarUrl = `assets/avatars/${avatarUrl}`;
  }
  avatarUrl = `${API_BASE_URL}/${avatarUrl}`;
}


      avatarImg.src = avatarUrl;



     logoutBtn.addEventListener('click', () => {

  localStorage.removeItem('token');

  localStorage.removeItem('username');

  localStorage.removeItem('avatar');

  window.location.href = 'index.html'; 

});





      userDropdown.addEventListener('click', (e) => {

        e.stopPropagation();

        userDropdown.classList.toggle('active');

      });



      document.addEventListener('click', () => {

        userDropdown.classList.remove('active');

      });

      // Update translations for the user menu
      updateTranslations();

    })

    .catch(() => {

      localStorage.removeItem('token');

      location.reload();

    });

}

