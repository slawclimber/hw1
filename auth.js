// auth.js

// 👉 Import Firebase SDK z CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔐 Twoja pełna konfiguracja Firebase (UDOSTĘPNIANA PRZEZ FIREBASE KONSOLE)
const firebaseConfig = {
   apiKey: "AIzaSyBYfO9kmsrq4-N1QenqnBFt_Mk7RFQZkPU",
    authDomain: "pwa1-463417.web.app",
    projectId: "pwa1-463417",
    storageBucket: "pwa1-463417.firebasestorage.app",
    messagingSenderId: "535969974495",
    appId: "1:535969974495:web:88a7112a05beb148ea016a"
};
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔒 Lista dozwolonych użytkowników
const allowedUsers = ["slawecheck@gmail.com"];

// 🔁 Obsługa powrotu z logowania
getRedirectResult(auth)
  .then((result) => {
    if (result && result.user) {
      const user = result.user;
      console.log("Zalogowano jako:", user.email);

      if (!allowedUsers.includes(user.email)) {
        alert("Nie masz dostępu.");
        signOut(auth);
        return;
      }

      // 🔐 Pobieramy token i zapisujemy
      user.getIdToken().then((token) => {
        localStorage.setItem("idToken", token);
        window.location.href = "/secure";
      });
    } else {
      console.log("Brak użytkownika.");
    }
  })
  .catch((error) => {
    console.error("Błąd logowania:", error);
  });

// 🟥 Obsługa przycisku logowania (login.html)
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login");
  const statusText = document.getElementById("status");
  const logoutButton = document.getElementById("logout");

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      signInWithRedirect(auth, provider);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth).then(() => {
        localStorage.removeItem("idToken");
        window.location.href = "/login.html";
      });
    });
  }

  if (statusText && auth.currentUser) {
    statusText.textContent = `Jesteś już zalogowany jako ${auth.currentUser.email}`;
  }

  // ✅ Dynamiczne ładowanie /secure
  if (window.location.pathname === "/secure") {
    const token = localStorage.getItem("idToken");
    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    fetch("/secure", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Brak dostępu");
        return res.text();
      })
      .then((html) => {
        document.open();
        document.write(html);
        document.close();
      })
      .catch((err) => {
        console.error("Błąd ładowania strony secure:", err);
        window.location.href = "/login.html";
      });
  }
});
