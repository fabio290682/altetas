import { initializeApp } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const env = import.meta.env as Record<string, string | undefined>;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const REQUIRED_CONFIG_KEYS: Array<keyof FirebaseOptions> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const hasRequiredFirebaseConfig = REQUIRED_CONFIG_KEYS.every((key) => {
  const value = firebaseConfig[key];
  return typeof value === 'string' && value.trim().length > 0;
});

const app = hasRequiredFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const isFirebaseConfigured = hasRequiredFirebaseConfig;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

let anonymousAuthPromise: Promise<void> | null = null;

export async function ensureFirebaseAuth(): Promise<void> {
  if (!auth) return;
  if (auth.currentUser) return;

  if (!anonymousAuthPromise) {
    anonymousAuthPromise = signInAnonymously(auth).then(() => undefined);
  }

  await anonymousAuthPromise;
}
