import { getAuthStrategy } from "../api/auth";
import type { AuthAdapter } from "./auth-adapter";
import { PasswordAuthAdapter } from "./password-auth-adapter";
import { FirebaseAuthAdapter } from "./firebase-auth-adapter";

export type { AuthAdapter } from "./auth-adapter";

let _adapter: AuthAdapter | null = null;

export function createAuthAdapter(): AuthAdapter {
  if (!_adapter) {
    _adapter =
      getAuthStrategy() === "firebase"
        ? new FirebaseAuthAdapter()
        : new PasswordAuthAdapter();
  }
  return _adapter;
}
