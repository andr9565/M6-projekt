// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";


//lets gogogogoggoo
//tim
// Your web app's Firebase configuration
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

// Initialize Firebase (kun én gang)
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Hurtig database-test
async function testRealtimeDatabase() {
  const statusEl = document.getElementById("status");

  try {
    const testRef = ref(database, "test/connection");
    await set(testRef, { ok: true, timestamp: Date.now() });

    const snapshot = await get(testRef);
    console.log("Realtime Database OK:", snapshot.val());

    if (statusEl) {
      statusEl.textContent = "✅ Firebase virker";
      statusEl.style.color = "green";
    }
  } catch (error) {
    console.error("Database fejl:", error);

    if (statusEl) {
      statusEl.textContent = "❌ Firebase fejl: " + error.message;
      statusEl.style.color = "red";
    }
  }
}

testRealtimeDatabase();