import { apiRequest } from "./http";
import type { GoogleConnectionStatus } from "../types";

export type { GoogleConnectionStatus } from "../types";

export async function getGoogleStatus(): Promise<GoogleConnectionStatus> {
  const json = await apiRequest<{ data: GoogleConnectionStatus }>(
    "/auth/google/status"
  );
  return json.data;
}

export async function getGoogleAuthorizeUrl(
  redirectTo?: string
): Promise<string> {
  const params = redirectTo
    ? `?redirectTo=${encodeURIComponent(redirectTo)}`
    : "";
  const json = await apiRequest<{ data: { authorizeUrl: string } }>(
    `/auth/google/authorize${params}`
  );
  return json.data.authorizeUrl;
}

export async function disconnectGoogle(): Promise<void> {
  await apiRequest("/auth/google/disconnect", { method: "POST" });
}
