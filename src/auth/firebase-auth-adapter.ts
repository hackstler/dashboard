import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "../config/firebase";
import type { AuthAdapter } from "./auth-adapter";
import { loginWithFirebaseToken, registerWithInvite, logout as apiLogout } from "../api/auth";

const googleProvider = new GoogleAuthProvider();

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}

/**
 * Stores pending registration context so handleRedirectResult can complete
 * the flow when the user returns from a Google redirect (mobile).
 */
const REDIRECT_CONTEXT_KEY = "firebase_redirect_context";

interface RedirectContext {
  type: "login" | "register";
  inviteToken?: string;
  firstName?: string;
  lastName?: string;
}

function saveRedirectContext(ctx: RedirectContext): void {
  sessionStorage.setItem(REDIRECT_CONTEXT_KEY, JSON.stringify(ctx));
}

function consumeRedirectContext(): RedirectContext | null {
  const raw = sessionStorage.getItem(REDIRECT_CONTEXT_KEY);
  sessionStorage.removeItem(REDIRECT_CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RedirectContext;
  } catch {
    return null;
  }
}

export class FirebaseAuthAdapter implements AuthAdapter {
  readonly strategyName = "firebase" as const;
  readonly supportsPasswordManagement = false;

  async loginWithGoogle(): Promise<void> {
    const auth = getFirebaseAuth();

    if (isMobileDevice()) {
      saveRedirectContext({ type: "login" });
      await signInWithRedirect(auth, googleProvider);
      return; // page navigates away
    }

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    await loginWithFirebaseToken(idToken);
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    await loginWithFirebaseToken(idToken);
  }

  async registerWithGoogle(
    inviteToken: string,
    firstName?: string,
    lastName?: string,
  ): Promise<void> {
    const auth = getFirebaseAuth();

    if (isMobileDevice()) {
      saveRedirectContext({ type: "register", inviteToken, firstName, lastName });
      await signInWithRedirect(auth, googleProvider);
      return; // page navigates away
    }

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    await registerWithInvite({
      inviteToken,
      idToken,
      firstName,
      lastName,
    });
  }

  async registerWithCredentials(
    inviteToken: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<void> {
    const auth = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    await registerWithInvite({
      inviteToken,
      idToken,
      firstName,
      lastName,
    });
  }

  async handleRedirectResult(): Promise<boolean> {
    const auth = getFirebaseAuth();
    const result = await getRedirectResult(auth);
    if (!result) return false;

    const idToken = await result.user.getIdToken();
    const ctx = consumeRedirectContext();

    if (ctx?.type === "register" && ctx.inviteToken) {
      await registerWithInvite({
        inviteToken: ctx.inviteToken,
        idToken,
        firstName: ctx.firstName,
        lastName: ctx.lastName,
      });
    } else {
      await loginWithFirebaseToken(idToken);
    }

    return true;
  }

  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    await signOut(auth);
    apiLogout();
  }
}
