import { useState, useCallback } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "../config/firebase";

const MAGIC_LINK_STORAGE_KEY = "firebase_magic_link_email";

const googleProvider = new GoogleAuthProvider();

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}

interface UseFirebaseAuthReturn {
  signInWithGoogle: () => Promise<string>;
  handleRedirectResult: () => Promise<string | null>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLink: () => Promise<string | null>;
  signOutFirebase: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogleFn = useCallback(async (): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();

      // Mobile: use redirect to avoid popup blocking
      if (isMobileDevice()) {
        await signInWithRedirect(auth, googleProvider);
        // Page redirects away — result handled by handleRedirectResult on return
        return "";
      }

      // Desktop: use popup
      const result = await signInWithPopup(auth, googleProvider);
      return await result.user.getIdToken();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRedirectResultFn = useCallback(async (): Promise<string | null> => {
    try {
      const auth = getFirebaseAuth();
      const result = await getRedirectResult(auth);
      if (result) {
        return await result.user.getIdToken();
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Redirect sign-in failed";
      setError(message);
      return null;
    }
  }, []);

  const sendMagicLinkFn = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem(MAGIC_LINK_STORAGE_KEY, email);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send magic link";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeMagicLinkFn = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      let email = localStorage.getItem(MAGIC_LINK_STORAGE_KEY);
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      if (!email) {
        throw new Error("Email is required to complete sign-in");
      }

      const result = await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem(MAGIC_LINK_STORAGE_KEY);
      const idToken = await result.user.getIdToken();
      return idToken;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete magic link sign-in";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutFirebaseFn = useCallback(async (): Promise<void> => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }, []);

  const getIdTokenFn = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(true);
  }, []);

  return {
    signInWithGoogle: signInWithGoogleFn,
    handleRedirectResult: handleRedirectResultFn,
    sendMagicLink: sendMagicLinkFn,
    completeMagicLink: completeMagicLinkFn,
    signOutFirebase: signOutFirebaseFn,
    getIdToken: getIdTokenFn,
    loading,
    error,
  };
}
