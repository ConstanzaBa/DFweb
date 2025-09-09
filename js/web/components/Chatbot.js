document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const userInput = document.getElementById("userInput");

  function toggleChatbot() {
    if (!chatContainer) return;
    chatContainer.classList.toggle("open");

    if (chatContainer.classList.contains("open")) {
      loadCopilot();
    }
  }

  function displayMessage(message, sender) {
    const chatLog = document.getElementById("chat-log");
    if (!chatLog) return;

    const messageElement = document.createElement("div");
    messageElement.classList.add(sender);
    messageElement.textContent = message;

    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  if (userInput) {
    userInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        sendMessage?.();
      }
    });
  }

  function loadCopilot() {
    if (!chatContainer) return;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "copilot.html", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        chatContainer.innerHTML = xhr.responseText;
      }
    };
    xhr.send();
  }

  if (chatContainer) {
    chatContainer.addEventListener("transitionend", function () {
      if (this.classList.contains("open")) {
        loadCopilot();
      }
    });
  }

  // Token fetch (async IIFE)
  (async function () {
    try {
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

      if (!res.ok) return;
      const data = await res.json();
      // usar "data" seg¨²n necesidad
    } catch (error) {
      // Fail silently si se quiere
    }
  })();

  // Exponer funciones globalmente si se necesita
  window.toggleChatbot = toggleChatbot;
  window.displayMessage = displayMessage;
});
