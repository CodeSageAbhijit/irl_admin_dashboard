import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Use the default app to avoid named-app SDK bugs with long-polling cleanup URLs
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db: ReturnType<typeof getFirestore>;
try {
  // experimentalAutoDetectLongPolling is safer than Force – avoids ad-blocker issues
  // on getDocs (one-time reads) while still working in constrained environments
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
} catch {
  db = getFirestore(app);
}

export { db };
