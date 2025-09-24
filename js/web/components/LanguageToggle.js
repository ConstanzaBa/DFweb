import { translations } from "../../utils/consts.js";

// Language Settings
let currentLanguage = localStorage.getItem("language") || "es-ES"; 

function getCurrentLanguage() {
  return currentLanguage;
}

function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  document.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: lang }
  }));
  return currentLanguage;
}

function toggleLanguage() {
  const newLang = currentLanguage === "es-ES" ? "en-US" : "es-ES";
  return changeLanguage(newLang);
}

function translate(key, lang = getCurrentLanguage()) {
  return translations[lang][key] || key;
}

function setupLanguageToggle() {
  const languageToggle = document.getElementById("language-toggle");
  if (!languageToggle) return;

  languageToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleLanguage();
  });
}

export { getCurrentLanguage, changeLanguage, toggleLanguage, setupLanguageToggle };