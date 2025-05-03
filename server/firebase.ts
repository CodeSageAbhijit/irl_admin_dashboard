// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBbtT6nNm6-68UyMjkAElIjgAX_Y3137UU",
    authDomain: "irl-inventory-8ebab.firebaseapp.com",
    projectId: "irl-inventory-8ebab",
    storageBucket: "irl-inventory-8ebab.firebasestorage.app",
    messagingSenderId: "622498137850",
    appId: "1:622498137850:web:7128867a7e14845cda6b43"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
