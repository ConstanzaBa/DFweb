function toggleChatbot() {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.classList.toggle("open"); // Cambia la clase para abrir/cerrar el chat

  if (chatContainer.classList.contains("open")) {
    loadCopilot();
  }
}

function displayMessage(message, sender) {
  const chatLog = document.getElementById("chat-log");
  const messageElement = document.createElement("div");
  messageElement.classList.add(sender);
  messageElement.textContent = message;

  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight; // Hacer scroll hacia abajo
}

// Event listener para enviar mensaje al presionar Enter
document
  .getElementById("userInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

// Función para cargar copilot.html
function loadCopilot() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "copilot.html", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const chatContainer = document.getElementById("chat-container");
      chatContainer.innerHTML = xhr.responseText;
    }
  };
  xhr.send();
}

// Llamar a la función loadCopilot al abrir el chatbot
document
  .getElementById("chat-container")
  .addEventListener("transitionend", function () {
    if (this.classList.contains("open")) {
      loadCopilot();
    }
  });

(async function () {
  const res = await fetch(
    "https://default0b159b29f7f54a66ae5848bc907866.de.environment.api.powerplatform.com/powervirtualagents/botsbyschema/crf82_dragonFilmsCopilot/directline/token?api-version=2022-03-01-preview",
    {
      method: "POST",
      headers: {
        Authorization:
          "Bearer p-IxefwcB84.zPOrQiD8nGBBs2BPKKdN4C-1MX5Ybp2cIdMbji2OZPI",
      },
    }
  );

  const data = await res.json();
  console.log(data);
})();
