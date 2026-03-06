// app.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
