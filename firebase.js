import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjKF_H39GWA3LGRL8TDlGf1Qu_21IDElk",
  authDomain: "portfolio-website-1be41.firebaseapp.com",
  projectId: "portfolio-website-1be41",
  storageBucket: "portfolio-website-1be41.firebasestorage.app",
  messagingSenderId: "244023419373",
  appId: "1:244023419373:web:c8acc9430e4ec736c7c7e4",
  measurementId: "G-03J3EDRYGQ"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Expose submit function for main.js
window.submitContactForm = async function(name, email, message) {
  await addDoc(collection(db, "messages"), {
    name,
    email,
    message,
    createdAt: serverTimestamp()
  });
};
