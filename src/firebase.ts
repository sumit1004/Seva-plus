// Firebase config and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAghwpglPoAFQ0yxhqEzUdAWgA7PBmzKFg",
    authDomain: "seva-plus.firebaseapp.com",
    projectId: "seva-plus",
    storageBucket: "seva-plus.firebasestorage.app",
    messagingSenderId: "720871242138",
    appId: "1:720871242138:web:c7da185d569e92baf6e223",
    measurementId: "G-EDCX0EPFLV"
  // ...other config...
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { app };
