import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/**
 * Lazy Firebase init — only initializes when actually called.
 * If VITE_FIREBASE_API_KEY is missing, throws a clear error
 * instead of crashing the entire app on import.
 */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;

  const apiKey = import.meta.env["VITE_FIREBASE_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "Firebase not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID."
    );
  }

  app = initializeApp({
    apiKey,
    authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
    projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  });
  auth = getAuth(app);
  return auth;
}
