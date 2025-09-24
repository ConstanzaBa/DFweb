// i18n Configuration
import { translations } from './consts.js';

// Simple translation system that works with or without i18n-js
let currentLanguage = localStorage.getItem('language') || 'es-ES';

// Initialize i18n-js if available
function initializeI18n() {
  if (typeof I18n !== 'undefined') {
    I18n.translations = translations;
    I18n.defaultLocale = 'es-ES';
    I18n.currentLocale = currentLanguage;
    I18n.locale = currentLanguage;
    return true;
  }
  return false;
}

// Try to initialize i18n-js
let i18nAvailable = false;
if (typeof I18n !== 'undefined') {
  i18nAvailable = initializeI18n();
} else {
  // Wait for i18n-js to load
  const checkI18n = setInterval(() => {
    if (typeof I18n !== 'undefined') {
      i18nAvailable = initializeI18n();
      clearInterval(checkI18n);
    }
  }, 50);
  
  // Stop checking after 5 seconds
  setTimeout(() => clearInterval(checkI18n), 5000);
}

// Helper function to get current language
export function getCurrentLanguage() {
  return currentLanguage;
}

// Helper function to change language
export function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // Update i18n-js if available
  if (i18nAvailable && typeof I18n !== 'undefined') {
    I18n.currentLocale = lang;
    I18n.locale = lang;
  }
  
  // Dispatch custom event for other components
  document.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: lang }
  }));
  
  // Update all elements with data-translate attributes
  updateTranslations();
  
  return currentLanguage;
}

// Helper function to toggle between languages
export function toggleLanguage() {
  const newLang = currentLanguage === 'es-ES' ? 'en-US' : 'es-ES';
  return changeLanguage(newLang);
}

// Helper function to translate text
export function translate(key, options = {}) {
  if (i18nAvailable && typeof I18n !== 'undefined') {
    return I18n.t(key, options);
  }
  // Fallback to direct translation lookup
  return translations[currentLanguage]?.[key] || key;
}

// Function to update all elements with data-translate attributes
export function updateTranslations() {
  const elements = document.querySelectorAll('[data-translate]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-translate');
    const translatedText = translate(key);
    
    if (element.tagName === 'INPUT' && element.type === 'text') {
      element.placeholder = translatedText;
    } else {
      element.textContent = translatedText;
    }
  });
  
  // Update language toggle button text
  const languageToggle = document.getElementById('currentLanguage');
  if (languageToggle) {
    languageToggle.textContent = translate('currentLanguage');
  }
}

// Function to setup language toggle button
export function setupLanguageToggle() {
  const languageToggle = document.getElementById('languageToggle');
  if (!languageToggle) {
    console.log('Language toggle button not found');
    return;
  }

  languageToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleLanguage();
  });
  
  // Set initial language display
  const currentLanguageDisplay = document.getElementById('currentLanguage');
  if (currentLanguageDisplay) {
    currentLanguageDisplay.textContent = translate('currentLanguage');
  }
}

// Initialize translations on page load
document.addEventListener('DOMContentLoaded', () => {
  updateTranslations();
});

// Listen for language changes
document.addEventListener('languageChanged', () => {
  updateTranslations();
});
