import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8YfPY2x1IUyK1mql8R2LANO6S5zzVKhg",
  authDomain: "footyam-main.firebaseapp.com",
  projectId: "footyam-main",
  storageBucket: "footyam-main.firebasestorage.app",
  messagingSenderId: "352084731727",
  appId: "1:352084731727:web:4d8fa986f70de51e93873a",
  measurementId: "G-TGPWVTT0BK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);