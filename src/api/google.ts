const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface GoogleConnectionStatus {
  connected: boolean;
  scopes: string[];
}

export async function getGoogleStatus(): Promise<GoogleConnectionStatus> {
  const res = await fetch(`${BASE_URL}/auth/google/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const json = (await res.json()) as { data: GoogleConnectionStatus };
  return json.data;
}

export async function getGoogleAuthorizeUrl(redirectTo?: string): Promise<string> {
  const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : "";
  const res = await fetch(`${BASE_URL}/auth/google/authorize${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Authorize ${res.status}`);
  const json = (await res.json()) as { data: { authorizeUrl: string } };
  return json.data.authorizeUrl;
}

export async function disconnectGoogle(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/google/disconnect`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Disconnect ${res.status}`);
}
