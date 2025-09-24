// /home1/dragonfilms/public_html/js/web/components/Chatbot.js
let myLandbot;

function initLandbot() {
  if (!myLandbot) {
    const s = document.createElement('script');
    s.type = "module";
    s.async = true;

    s.addEventListener('load', function () {
      myLandbot = new Landbot.Livechat({
        configUrl: 'https://storage.googleapis.com/landbot.online/v3/H-3142306-YQAVBAMT07NXR5V6/index.json',
      });
    });

    s.src = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
    const x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  }
}

// Inicializar al cargar la página o al interactuar (mouseover/touchstart)
window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('mouseover', initLandbot, { once: true });
  window.addEventListener('touchstart', initLandbot, { once: true });
});
