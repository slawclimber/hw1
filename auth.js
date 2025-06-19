function handleGoogleLogin(response) {
  const statusEl = document.getElementById('loginStatus');
  
  // Sprawdź czy otrzymano dane
  if (!response || !response.credential) {
    showLoginError('Błąd logowania', 'Nie otrzymano danych z Google');
    return;
  }
  
  try {
    // Dekoduj token JWT
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userEmail = payload.email.toLowerCase();
    const isEmailVerified = payload.email_verified;
    
    // Sprawdź weryfikację emaila
    if (!isEmailVerified) {
      showLoginError('Email niezweryfikowany', 'Potwierdź adres email w Google');
      return;
    }
    
    // Lista dozwolonych użytkowników
    const ALLOWED_USERS = [
      "slawecheck@gmail.com"
    ].map(email => email.toLowerCase());
    
    // Sprawdź dostęp
    if (ALLOWED_USERS.includes(userEmail)) {
      // Zalogowano pomyślnie
      localStorage.setItem('google_token', response.credential);
      localStorage.setItem('user_email', userEmail);
      
      statusEl.innerHTML = `
        <p class="success">Logowanie udane!</p>
        <p>Przekierowuję...</p>
      `;
      
      // Przekieruj po 1 sekundzie
      setTimeout(() => window.location.href = '/hw1/', 1000);
    } else {
      showLoginError('Brak dostępu', `Konto ${userEmail} nie ma dostępu`);
    }
  } catch (error) {
    showLoginError('Błąd systemu', error.message);
  }
}

// Wyświetl błąd logowania
function showLoginError(title, message) {
  const statusEl = document.getElementById('loginStatus');
  if (!statusEl) return;
  
  statusEl.innerHTML = `
    <p class="error">${title}</p>
    <p>${message}</p>
    <button class="retry-btn">Spróbuj ponownie</button>
  `;
  
  // Dodaj obsługę przycisku
  const retryBtn = statusEl.querySelector('.retry-btn');
  if (retryBtn) retryBtn.addEventListener('click', () => window.location.reload());
}
