import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCHttZI20Cq-UARslBukwbQu6rdTv-wU4Q",
    authDomain: "krishimitra-flc8o0.firebaseapp.com",
    projectId: "krishimitra-flc8o0",
    storageBucket: "krishimitra-flc8o0.firebasestorage.app",
    messagingSenderId: "685042452583",
    appId: "1:685042452583:android:5d8cd487d3a4315a9c2cc2"
};

let app;
let auth;
let db;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

db = getFirestore(app);

export { auth, db };
