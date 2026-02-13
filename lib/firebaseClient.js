import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Get this from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'foodfest-26299',
  // For read-only Firestore access, you can use these minimal settings
  // Add other config if needed (apiKey, authDomain, etc.)
};

// Initialize Firebase for client-side
let app;
let db;

export function getClientDb() {
  if (!db) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
  }
  return db;
}

export default getClientDb;
