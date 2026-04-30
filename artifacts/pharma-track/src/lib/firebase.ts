import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "amr-predictor",
  appId: "1:662633984341:web:12641eaee476f67e12ffdc",
  storageBucket: "amr-predictor.firebasestorage.app",
  apiKey: "AIzaSyBGEmFol8zS_nYtRBfBqxFGzKjSsaSHcSY",
  authDomain: "amr-predictor.firebaseapp.com",
  messagingSenderId: "662633984341",
  measurementId: "G-8FTGNVR4X8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
