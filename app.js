import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBd3Gt34F1IvP-_Dv1lO7HGYRuek_dD7s0",
  authDomain: "m5-projekt.firebaseapp.com",
  databaseURL: "https://m5-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "m5-projekt",
  storageBucket: "m5-projekt.firebasestorage.app",
  messagingSenderId: "391585508161",
  appId: "1:391585508161:web:2ddb1af59a8e760438cfc0",
  measurementId: "G-EHDCTK3YHZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const statusEl = document.getElementById("status");

function showStatus(message, color) {
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.color = color;
  }
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      showStatus("Brugeren findes ikke", "#d93025");
      return;
    }

    const user = snapshot.val();

    if (user.password !== password) {
      showStatus("Forkert adgangskode", "#d93025");
      return;
    }

    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html";
  });
}

// OPRET BRUGER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !password) {
      showStatus("Udfyld venligst alle felter", "#d93025");
      return;
    }

    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      showStatus("Brugernavnet findes allerede", "#d93025");
      return;
    }

    await set(userRef, {
      username: username,
      password: password,
      createdAt: Date.now()
    });

    showStatus("Konto oprettet! Du sendes til login...", "green");

    setTimeout(function () {
      window.location.href = "index.html";
    }, 1200);
  });
}

// LOG UD
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });
}