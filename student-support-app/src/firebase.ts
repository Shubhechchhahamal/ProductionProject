import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnlvFLUQlRMbCCidmCo6eHY8yH-jHseME",
  authDomain: "homeaway-ab63f.firebaseapp.com",
  projectId: "homeaway-ab63f",
  storageBucket: "homeaway-ab63f.appspot.com", // ✅ FIXED
  messagingSenderId: "211379063714",
  appId: "1:211379063714:web:f734919ae715e573a4c0fb",
  measurementId: "G-87BKFQHKVG",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence enabled");
  })
  .catch((err) => console.error("Persistence error", err));


// Firestore
export const db = getFirestore(app);
