import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyATjhPDDzVhZfKOZcKTWYj7EiqQcfx5Wl0",
    authDomain: "boost-productivity-126b9.firebaseapp.com",
    projectId: "boost-productivity-126b9",
    storageBucket: "boost-productivity-126b9.firebasestorage.app",
    messagingSenderId: "527676361193",
    appId: "1:527676361193:web:5442c4919f0989b5102378",
    measurementId: "G-41Q1PB5MEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get Firestore instance
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Get Auth instance
export const auth = getAuth(app);

export default app; 