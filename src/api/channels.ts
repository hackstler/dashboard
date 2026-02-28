const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface WhatsAppStatus {
  status: "disconnected" | "qr" | "connected";
  phone: string | null;
  updatedAt?: string;
}

export async function getWhatsappStatus(): Promise<WhatsAppStatus> {
  const res = await fetch(`${BASE_URL}/channels/whatsapp/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const json = (await res.json()) as { data: WhatsAppStatus };
  return json.data;
}

export async function getWhatsappQr(): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/channels/whatsapp/qr`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`QR ${res.status}`);
  const json = (await res.json()) as { data: { qrData: string } };
  return json.data.qrData;
}

export async function disconnectWhatsapp(): Promise<void> {
  const res = await fetch(`${BASE_URL}/channels/whatsapp/disconnect`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Disconnect ${res.status}`);
}
