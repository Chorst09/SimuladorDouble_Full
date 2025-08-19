
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

const app = getFirebaseApp();
const db = app ? getFirestore(app) : null;

function getFirebaseApp(): FirebaseApp | null {
    if (typeof window === "undefined" || !firebaseConfig.apiKey) {
        return null;
    }

    if (getApps().length > 0) {
        return getApp();
    } else {
        return initializeApp(firebaseConfig);
    }
}

export { app, db, firebaseConfig };
