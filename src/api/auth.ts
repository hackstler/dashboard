import { apiRequest } from "./http";
import type { User, LoginResponse } from "../types";

export type { AuthStrategyType, LoginResponse } from "../types";

export function getAuthStrategy(): "password" | "firebase" {
  const raw = import.meta.env["VITE_AUTH_STRATEGY"];
  if (raw === "firebase") return "firebase";
  return "password";
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
    public: true,
  });
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function loginWithFirebaseToken(
  idToken: string
): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { idToken },
    public: true,
  });
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function getMe(): Promise<User | null> {
  if (!isLoggedIn()) return null;
  try {
    const data = await apiRequest<{
      userId: string;
      username: string;
      orgId: string;
      role?: string;
    }>("/auth/me");
    return {
      id: data.userId,
      username: data.username,
      orgId: data.orgId,
      role: (data.role === "admin" ? "admin" : data.role === "super_admin" ? "super_admin" : "user") as User["role"],
    };
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("auth_token");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("auth_token") !== null;
}

export async function updateProfile(data: { email?: string; password?: string }): Promise<void> {
  await apiRequest("/auth/profile", {
    method: "PATCH",
    body: data,
  });
}
