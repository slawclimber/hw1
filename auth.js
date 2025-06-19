// auth.js

// 👉 Import Firebase SDK z CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔐 Twoja pełna konfiguracja Firebase (UDOSTĘPNIANA PRZEZ FIREBASE KONSOLE)
const firebaseConfig = {
   apiKey: "AIzaSyBYfO9kmsrq4-N1QenqnBFt_Mk7RFQZkPU",
    authDomain: "pwa1-463417.firebaseapp.com",
    projectId: "pwa1-463417",
    storageBucket: "pwa1-463417.firebasestorage.app",
    messagingSenderId: "535969974495",
    appId: "1:535969974495:web:88a7112a05beb148ea016a"
};

// 🔌 Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Lista dozwolonych użytkowników testowych
const allowedUsers = ["slawecheck@gmail.com"];

getRedirectResult(auth)
  .then((result) => {
    console.log("getRedirectResult:", result);
    if (result && result.user) {
      const user = result.user;
      console.log("Zalogowano jako:", user.email);

      const statusText = document.getElementById("status");
      if (statusText) statusText.textContent = `Zalogowano jako ${user.email}`;

      if (!allowedUsers.includes(user.email)) {
        if (statusText)
          statusText.textContent = `Brak dostępu dla ${user.email}`;
        return signOut(auth);
      }

      // ✅ Sukces — przekieruj
      setTimeout(() => {
        window.location.href = "secure.html";
      }, 1000);
    } else {
      console.log("Brak użytkownika — nie zalogowano.");
    }
  })
  .catch((error) => {
    console.error("Błąd logowania przez redirect:", error);
  });


// ✅ 2. Dopiero po załadowaniu DOM dodaj zdarzenia click
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login");
  const logoutButton = document.getElementById("logout");
  const statusText = document.getElementById("status");

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      console.log("Rozpoczynam redirect...");
      signInWithRedirect(auth, provider);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      console.log("Wylogowanie");
      signOut(auth)
        .then(() => {
          window.location.href = "login.html";
        })
        .catch(console.error);
    });
  }

  if (statusText && !auth.currentUser) {
    statusText.textContent = "Nie jesteś zalogowany.";
  }
});
