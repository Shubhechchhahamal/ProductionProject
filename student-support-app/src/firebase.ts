import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnlvFLUQlRMbCCidmCo6eHY8yH-jHseME",
  authDomain: "homeaway-ab63f.firebaseapp.com",
  projectId: "homeaway-ab63f",
  storageBucket: "homeaway-ab63f.appspot.com",
  messagingSenderId: "211379063714",
  appId: "1:211379063714:web:f734919ae715e573a4c0fb",
  measurementId: "G-87BKFQHKVG",

  // ✅ ONLY ADD THIS LINE
  databaseURL: "https://homeaway-ab63f-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence enabled");
  })
  .catch((err) => console.error("Persistence error", err));

// 🔥 Firestore (unchanged)
export const db = getFirestore(app);

// ⚡ Realtime DB (this now points to correct region)
export const rtdb = getDatabase(app);