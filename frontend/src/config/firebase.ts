import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBs8DpeU2fU6B-FschMDW9NrEz2x0HvctE",
    authDomain: "web-dev-7302e.firebaseapp.com",
    projectId: "web-dev-7302e",
    storageBucket: "web-dev-7302e.firebasestorage.app",
    messagingSenderId: "633005271436",
    appId: "1:633005271436:web:7b4920a6acfa0422c54ea9",
    measurementId: "G-58GH79GSEJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// User interface for Firestore
export interface FirestoreUser {
    uid: string;
    name: string;
    email: string;
    role?: 'customer' | 'admin';
    createdAt: Timestamp;
    photoURL?: string;
}

// Export Firebase services
export {
    auth,
    db,
    app,
    googleProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    type FirebaseUser as User
};
