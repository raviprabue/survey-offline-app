import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCZaG0u7xMETIJPSakZYLzLtdlpYJ8MRn4",
  authDomain: "cgsurvey-sblr.firebaseapp.com",
  projectId: "cgsurvey-sblr",
  storageBucket: "cgsurvey-sblr.firebasestorage.app",
  messagingSenderId: "678009287965",
  appId: "1:678009287965:web:b0972c984ee0e2e7485df4"
};

// Initialize Firebase ONCE
const app = initializeApp(firebaseConfig);

// Firestore
export const firestore = getFirestore(app);

// Storage (for photos)
export const storage = getStorage(app);