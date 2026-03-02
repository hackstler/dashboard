import type { User } from "../types";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

export type AuthStrategyType = "password" | "firebase";

export function getAuthStrategy(): AuthStrategyType {
  const raw = import.meta.env["VITE_AUTH_STRATEGY"];
  if (raw === "firebase") return "firebase";
  return "password";
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; orgId: string; role: string };
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Login failed" }))) as {
      error: string;
      message?: string;
    };
    throw new Error(err.message ?? err.error);
  }
  const data = (await res.json()) as LoginResponse;
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function loginWithFirebaseToken(
  idToken: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Login failed" }))) as {
      error: string;
      message?: string;
    };
    throw new Error(err.message ?? err.error);
  }
  const data = (await res.json()) as LoginResponse;
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function getMe(): Promise<User | null> {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    userId: string;
    username: string;
    orgId: string;
    role?: string;
  };
  return {
    id: data.userId,
    username: data.username,
    orgId: data.orgId,
    role: (data.role === "admin" ? "admin" : "user") as User["role"],
  };
}

export function logout(): void {
  localStorage.removeItem("auth_token");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("auth_token") !== null;
}
