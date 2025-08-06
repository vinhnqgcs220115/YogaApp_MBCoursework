// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDDpFXklFpWbpLFo3_TCe2YMeZEQDkxQIE',
  authDomain: 'universalyoga-admin.firebaseapp.com',
  projectId: 'universalyoga-admin',
  storageBucket: 'universalyoga-admin.firebasestorage.app',
  messagingSenderId: '498142849808',
  appId: '1:498142849808:android:b87238ae27f0ee6a6cd395',
};

// Initialize Firebase App with logging
let app;
let auth;

try {
  if (!getApps().length) {
    console.log('Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    console.log('Getting existing Firebase app...');
    app = getApp()[0];
    console.log('Retrieved existing Firebase app');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Auth with enhanced error handling
try {
  console.log('Initializing Firebase Auth...');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    console.log('Auth already initialized, getting existing instance');
    auth = getAuth(app);
  } else {
    console.error('Error initializing Auth:', error);
    throw error;
  }
}

// Initialize Firestore with logging
console.log('Initializing Firestore...');
const db = getFirestore(app);
console.log('Firestore initialized successfully');

// Connect to emulators if running locally
if (process.env.FIRESTORE_EMULATOR_HOST) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

// Verify initialization
console.log('Firebase initialization complete:', {
  appInitialized: !!app,
  authInitialized: !!auth,
  dbInitialized: !!db,
});

// Export instances
export { app, auth, db };
export default app;
