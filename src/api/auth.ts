import { apiRequest } from "./http";
import type { User, LoginResponse } from "../types";

export type { AuthStrategyType, LoginResponse } from "../types";

export function getAuthStrategy(): "password" | "firebase" {
  const raw = import.meta.env["VITE_AUTH_STRATEGY"];
  if (raw === "firebase") return "firebase";
  return "password";
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
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
      email: string;
      name: string | null;
      surname: string | null;
      orgId: string;
      role?: string;
    }>("/auth/me");
    return {
      id: data.userId,
      email: data.email,
      name: data.name ?? null,
      surname: data.surname ?? null,
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

export async function updateProfile(data: {
  email?: string;
  name?: string;
  surname?: string;
  password?: string;
}): Promise<User> {
  const resp = await apiRequest<{
    data: {
      id: string;
      email: string | null;
      name: string | null;
      surname: string | null;
      orgId: string;
      role: string;
      createdAt: string;
    };
  }>("/auth/profile", {
    method: "PATCH",
    body: data,
  });
  return {
    id: resp.data.id,
    email: resp.data.email ?? "",
    name: resp.data.name ?? null,
    surname: resp.data.surname ?? null,
    orgId: resp.data.orgId,
    role: (resp.data.role === "admin" ? "admin" : resp.data.role === "super_admin" ? "super_admin" : "user") as User["role"],
  };
}
