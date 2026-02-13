import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if environment variables are set
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('Please define FIREBASE_PROJECT_ID in .env.local');
}

// Initialize Firebase Admin SDK
let adminApp;
let db;

function initializeFirebase() {
  if (getApps().length === 0) {
    // Initialize with service account credentials if available
    if (process.env.FIREBASE_PRIVATE_KEY) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Initialize without credentials (useful for local development with emulator)
      adminApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    adminApp = getApps()[0];
  }

  db = getFirestore(adminApp);
  return db;
}

// Export the database instance
export function getDb() {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}

export default getDb;
