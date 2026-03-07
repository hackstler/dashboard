import { apiRequest, apiRequestNullable } from "./http";
import type {
  AdminUser,
  Organization,
  OrganizationDetail,
  CreateOrganizationData,
  UpdateOrganizationData,
  CreateUserData,
  InviteUserData,
  UpdateUserData,
  WhatsAppConnection,
  Invitation,
} from "../types";

export type {
  CreateUserData,
  InviteUserData,
  UpdateUserData,
  CreateOrganizationData,
  UpdateOrganizationData,
} from "../types";

export async function listUsers(filters?: {
  orgId?: string;
  search?: string;
}): Promise<{ items: AdminUser[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.orgId) params.set("orgId", filters.orgId);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiRequest(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function createUser(
  data: CreateUserData | InviteUserData
): Promise<AdminUser> {
  return apiRequest("/admin/users", { method: "POST", body: data });
}

export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<AdminUser> {
  return apiRequest(`/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest(`/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function listOrganizations(): Promise<{
  items: Organization[];
}> {
  return apiRequest("/admin/organizations");
}

export async function getOrganization(
  orgId: string
): Promise<OrganizationDetail> {
  return apiRequest(
    `/admin/organizations/${encodeURIComponent(orgId)}`
  );
}

export async function createOrganization(
  data: CreateOrganizationData
): Promise<{ orgId: string; admin: AdminUser }> {
  return apiRequest("/admin/organizations", { method: "POST", body: data });
}

export async function updateOrganization(
  orgId: string,
  data: UpdateOrganizationData
): Promise<OrganizationDetail> {
  return apiRequest(
    `/admin/organizations/${encodeURIComponent(orgId)}`,
    { method: "PUT", body: data }
  );
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await apiRequest(
    `/admin/organizations/${encodeURIComponent(orgId)}`,
    { method: "DELETE" }
  );
}

export async function getMyOrganization(): Promise<OrganizationDetail | null> {
  const data = await apiRequestNullable<{ data: OrganizationDetail }>("/org/me");
  return data?.data ?? null;
}

export async function getWhatsappConnections(): Promise<WhatsAppConnection[]> {
  const json = await apiRequest<{ items: WhatsAppConnection[] }>("/admin/whatsapp/sessions");
  return json.items;
}

export async function revokeWhatsappConnection(userId: string): Promise<void> {
  await apiRequest(`/admin/whatsapp/sessions/${userId}/revoke`, { method: "POST" });
}

// ── Invitations ─────────────────────────────────────────────────────────────

export async function createInvitation(data: {
  email?: string;
  role?: string;
}): Promise<{ invitation: Invitation; inviteUrl: string }> {
  return apiRequest("/admin/invitations", { method: "POST", body: data });
}

export async function listInvitations(): Promise<{ items: Invitation[] }> {
  return apiRequest("/admin/invitations");
}

export async function revokeInvitation(id: string): Promise<void> {
  await apiRequest(`/admin/invitations/${encodeURIComponent(id)}`, { method: "DELETE" });
}
