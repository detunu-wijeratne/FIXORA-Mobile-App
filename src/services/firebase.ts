import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2FonKaKjHHxc3YYDVEpBCdJjyJ1bZmEc",
  authDomain: "fixora-c65f5.firebaseapp.com",
  projectId: "fixora-c65f5",
  storageBucket: "fixora-c65f5.firebasestorage.app",
  messagingSenderId: "1071620665482",
  appId: "1:1071620665482:web:e72b794ed89cd8c442fd73",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);