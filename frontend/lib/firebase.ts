// Firebase configuration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration with fallback values for development
// Clean any potential newline characters from environment variables
const cleanEnvVar = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  return value.replace(/[\r\n]/g, '').trim();
};

// Use hardcoded values for now to ensure Firebase works
const firebaseConfig = {
  apiKey: "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU",
  authDomain: "razzwars-319e6.firebaseapp.com",
  projectId: "razzwars-319e6",
  storageBucket: "razzwars-319e6.firebasestorage.app",
  messagingSenderId: "211646977519",
  appId: "1:211646977519:web:3589f1d44eb511c032121a"
};

// Log Firebase configuration
console.log('🔥 Firebase Configuration:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with long polling for better connection stability
let db: any;
try {
  // Log configuration for debugging
  console.log('Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey
  });
  
  // Try to initialize with long polling first (better for production)
  // Also specify the database URL explicitly to avoid encoding issues
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    // Additional settings for better connection stability
    ignoreUndefinedProperties: true
  });
  console.log('Firestore initialized with long polling');
} catch (error) {
  // Fallback to regular getFirestore if long polling fails
  console.warn('Long polling initialization failed, falling back to regular Firestore:', error);
  try {
    // Try with explicit database configuration
    db = getFirestore(app, '(default)');
    console.log('Firestore initialized with regular connection');
  } catch (fallbackError) {
    console.error('Failed to initialize Firestore:', fallbackError);
    // Last resort - try without database specification
    try {
      db = getFirestore(app);
      console.log('Firestore initialized with default settings');
    } catch (finalError) {
      console.error('All Firestore initialization attempts failed:', finalError);
      throw finalError;
    }
  }
}

export { db };
export const auth = getAuth(app);

export default app;
