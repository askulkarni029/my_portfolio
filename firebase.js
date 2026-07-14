import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjKF_H39GWA3LGRL8TDlGf1Qu_21IDElk",
  authDomain: "portfolio-website-1be41.firebaseapp.com",
  projectId: "portfolio-website-1be41",
  storageBucket: "portfolio-website-1be41.firebasestorage.app",
  messagingSenderId: "244023419373",
  appId: "1:244023419373:web:c8acc9430e4ec736c7c7e4",
  measurementId: "G-03J3EDRYGQ"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── Contact form (public) ──
window.submitContactForm = async function (name, email, message) {
  await addDoc(collection(db, "messages"), {
    name, email, message,
    createdAt: serverTimestamp()
  });
};

// ── Generic collection helpers (used by public site + admin) ──
async function fetchCollection(name) {
  const q = query(collection(db, name), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

window.PortfolioData = {
  fetchProjects:      () => fetchCollection("projects"),
  fetchExperience:    () => fetchCollection("experience"),
  fetchTestimonials:  () => fetchCollection("testimonials"),
};

// ── Admin: auth ──
window.PortfolioAuth = {
  signIn:  (email, password) => signInWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
  onChange: (cb) => onAuthStateChanged(auth, cb),
};

// ── Admin: CRUD ──
function withOrderAndTimestamp(data) {
  return { ...data, createdAt: serverTimestamp() };
}

window.PortfolioAdmin = {
  add:    (col, data) => addDoc(collection(db, col), withOrderAndTimestamp(data)),
  update: (col, id, data) => updateDoc(doc(db, col, id), data),
  remove: (col, id) => deleteDoc(doc(db, col, id)),
  fetchAll: (col) => fetchCollection(col),
  fetchMessages: async () => {
    const snap = await getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  deleteMessage: (id) => deleteDoc(doc(db, "messages", id)),
};
