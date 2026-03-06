import { apiRequest, apiRequestNullable } from "./http";
import type { WhatsAppStatus } from "../types";

export type { WhatsAppStatus } from "../types";

export async function getWhatsappStatus(): Promise<WhatsAppStatus> {
  const json = await apiRequest<{ data: WhatsAppStatus }>(
    "/channels/whatsapp/status"
  );
  return json.data;
}

export async function getWhatsappQr(): Promise<string | null> {
  const json = await apiRequestNullable<{ data: { qrData: string } }>(
    "/channels/whatsapp/qr"
  );
  return json?.data.qrData ?? null;
}

export async function enableWhatsapp(): Promise<void> {
  await apiRequest("/channels/whatsapp/enable", { method: "POST" });
}

export async function disconnectWhatsapp(): Promise<void> {
  await apiRequest("/channels/whatsapp/disconnect", { method: "POST" });
}
