const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; orgId: string; role: string };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Login failed" }))) as {
      error: string;
    };
    throw new Error(err.error);
  }
  const data = (await res.json()) as LoginResponse;
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function getMe(): Promise<{
  id: string;
  email: string;
  orgId: string;
} | null> {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    data: { id: string; email: string; orgId: string };
  };
  return data.data;
}

export function logout(): void {
  localStorage.removeItem("auth_token");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("auth_token") !== null;
}
