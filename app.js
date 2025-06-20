// Stałe
const BASE_PATH = '/';

// Elementy DOM
const elements = {
  logoutButton: document.getElementById('logoutButton'),
  installContainer: document.getElementById('installContainer'),
  installButton: document.getElementById('installButton'),
  statusInfo: document.getElementById('statusInfo'),
  testConnection: document.getElementById('testConnection'),
  offlineBanner: document.getElementById('offlineBanner')
};

// Dane użytkownika
const userData = {
  token: localStorage.getItem('google_token'),
  email: localStorage.getItem('user_email')
};

// Sprawdź czy użytkownik jest zalogowany
if (!userData.token && !window.location.pathname.includes('login.html')) {
  window.location.href = `${BASE_PATH}login.html`;
}

// Funkcja aktualizacji statusu
function updateStatus(message, isError = false) {
  if (!elements.statusInfo) return;
  
  elements.statusInfo.innerHTML = `
    <p class="${isError ? 'error' : ''}">${message}</p>
    ${userData.email ? `<p>Zalogowany jako: ${userData.email}</p>` : ''}
  `;
}

// Sprawdź połączenie sieciowe
function checkConnection() {
  if (!navigator.onLine) {
    updateStatus('Jesteś offline - aplikacja używa danych z cache');
    document.body.classList.add('offline');
    if (elements.offlineBanner) elements.offlineBanner.classList.remove('hidden');
    return true;
  }
  
  if (elements.offlineBanner) elements.offlineBanner.classList.add('hidden');
  document.body.classList.remove('offline');
  return false;
}

// Wyloguj użytkownika
function logout() {
  localStorage.removeItem('google_token');
  localStorage.removeItem('user_email');
  window.location.href = `${BASE_PATH}login.html`;
}

// Rejestracja Service Workera
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${BASE_PATH}sw.js`, { scope: BASE_PATH })
      .then(reg => {
        console.log('Service Worker zarejestrowany:', reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              updateStatus('Dostępna nowa wersja aplikacji. Odśwież stronę.');
            }
          });
        });
      })
      .catch(error => {
        console.error('Błąd rejestracji Service Worker:', error);
        updateStatus(`Błąd rejestracji SW: ${error.message}`, true);
      });
  }
}

// Obsługa instalacji PWA
function setupPWAInstallation() {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (elements.installContainer) {
      elements.installContainer.classList.remove('hidden');
      updateStatus('Aplikacja może zostać zainstalowana');
    }
    
    if (elements.installButton) {
      elements.installButton.onclick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        updateStatus(outcome === 'accepted' 
          ? 'Aplikacja zostanie zainstalowana' 
          : 'Instalacja anulowana');
        
        deferredPrompt = null;
        if (elements.installContainer) elements.installContainer.classList.add('hidden');
      };
    }
  });
}

// Inicjalizacja aplikacji
function initApp() {
  // Stan sieci
  checkConnection();
  window.addEventListener('online', () => updateStatus('Połączenie internetowe zostało przywrócone'));
  window.addEventListener('offline', () => updateStatus('Jesteś offline - aplikacja używa danych z cache'));
  
  // Test połączenia
  if (elements.testConnection) {
    elements.testConnection.addEventListener('click', async () => {
      try {
        await fetch('https://www.google.com', { method: 'HEAD', cache: 'no-store' });
        updateStatus('Połączenie z Internetem działa poprawnie');
      } catch {
        updateStatus('Brak połączenia z Internetem', true);
      }
    });
  }
  
  // Przycisk wylogowania
  if (elements.logoutButton) {
    elements.logoutButton.addEventListener('click', logout);
    if (userData.token) elements.logoutButton.style.display = 'block';
  }
  
  // Tryb PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    updateStatus('Aplikacja działa w trybie standalone');
    if (elements.installContainer) elements.installContainer.classList.add('hidden');
  }
  
  // Inicjalny status
  updateStatus(userData.token 
    ? `Witaj ${userData.email || 'użytkowniku'}!` 
    : 'Aplikacja gotowa');
}

// Start aplikacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  setupPWAInstallation();
  initApp();
});

