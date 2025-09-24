

function loadFooter() {

  const footerContainer = document.getElementById('footer');

  if (!footerContainer) return;



  fetch('footer.html')

    .then(response => {

      if (!response.ok) throw new Error('No se pudo cargar el footer');

    return response.text();

    })

    .then(html => {

      const temp = document.createElement('div');

      temp.innerHTML = html;

      

      const footer = temp.querySelector('.footer');

      if (footer) {

        footerContainer.innerHTML = temp.innerHTML;

      }

    })

    .catch(error => console.error(error));

}



document.addEventListener('DOMContentLoaded', loadFooter);