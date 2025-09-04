import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAghwpglPoAFQ0yxhqEzUdAWgA7PBmzKFg",
    authDomain: "seva-plus.firebaseapp.com",
    projectId: "seva-plus",
    storageBucket: "seva-plus.firebasestorage.app",
    messagingSenderId: "720871242138",
    appId: "1:720871242138:web:c7da185d569e92baf6e223",
    measurementId: "G-EDCX0EPFLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
