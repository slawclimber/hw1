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

// 🖱️ Przyciski w DOM
const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
const statusText = document.getElementById("status");

// 🧭 Obsługa powrotu z redirect login
getRedirectResult(auth)
  .then((result) => {
	  console.log("Ładuję getRedirectResult...");
console.log("window.location.href", window.location.href);
    console.log("getRedirectResult:", result);
    if (result && result.user) {
      console.log("Zalogowano jako:", result.user.email);
      const user = result.user;

      // 🔐 Sprawdzenie czy użytkownik jest dozwolony
      if (!allowedUsers.includes(user.email)) {
        statusText.textContent = `Użytkownik ${user.email} nie ma dostępu.`;
        signOut(auth);
        return;
      }

      // ✅ Zalogowano – pokazujemy status i przekierowujemy
      statusText.textContent = `Zalogowano jako ${user.displayName}`;
      setTimeout(() => {
        window.location.href = "secure.html";
      }, 1000);
    } else {
      statusText.textContent = "Nie jesteś zalogowany.";
    }
  })
  .catch((error) => {
    console.error("Błąd logowania:", error);
    statusText.textContent = "Błąd podczas logowania.";
  });

// 🟩 Kliknięcie: logowanie
if (loginButton) {
  loginButton.addEventListener("click", () => {
    signInWithRedirect(auth, provider);
  });
}

// 🔴 Kliknięcie: wylogowanie
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}
