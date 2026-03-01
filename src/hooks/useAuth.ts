import { useState, useCallback } from "react";
import { login, logout, getMe, isLoggedIn } from "../api/auth";
import type { LoginResponse } from "../api/auth";
import type { User } from "../types";

interface UseAuthReturn {
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  getMe: () => Promise<User | null>;
  isLoggedIn: () => boolean;
  loading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await login(username, password);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    login: performLogin,
    logout,
    getMe,
    isLoggedIn,
    loading,
    error,
  };
}
