// Firebase configuration - Client-side only
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU",
  authDomain: "razzwars-319e6.firebaseapp.com",
  projectId: "razzwars-319e6",
  storageBucket: "razzwars-319e6.firebasestorage.app",
  messagingSenderId: "211646977519",
  appId: "1:211646977519:web:3589f1d44eb511c032121a"
};

// Initialize Firebase only on client-side
let app: any = null;
let db: any = null;
let auth: any = null;

if (typeof window !== 'undefined') {
  try {
    // Initialize Firebase only if it hasn't been initialized already
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Log Firebase configuration
    console.log('🔥 Firebase Configuration:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey
    });

    // Initialize Firestore with long polling for better connection stability
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      });
      console.log('Firestore initialized with long polling');
    } catch (error) {
      console.warn('Long polling initialization failed, falling back to regular Firestore:', error);
      try {
        db = getFirestore(app, '(default)');
        console.log('Firestore initialized with regular connection');
      } catch (fallbackError) {
        console.error('Failed to initialize Firestore:', fallbackError);
        try {
          db = getFirestore(app);
          console.log('Firestore initialized with default settings');
        } catch (finalError) {
          console.error('All Firestore initialization attempts failed:', finalError);
          throw finalError;
        }
      }
    }

    // Initialize Auth
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { db, auth };
export default app;
