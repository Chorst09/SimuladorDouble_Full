
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyB0XCQAYRxjzrA-IPDpSkRZIxd87HULzfw",
    projectId: "pre-sales-si9s9",
    storageBucket: "pre-sales-si9s9.firebasestorage.app",
    messagingSenderId: "420538039800",
    appId: "1:420538039800:web:6fd25ed7a573cb75bdaa0d"
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
