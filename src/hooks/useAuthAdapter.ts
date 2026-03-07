import { createAuthAdapter, type AuthAdapter } from "../auth";

const adapter = createAuthAdapter();

export function useAuthAdapter(): AuthAdapter {
  return adapter;
}
