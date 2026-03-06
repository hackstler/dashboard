import { apiRequest } from "./http";
import type {
  AdminUser,
  Organization,
  OrganizationDetail,
  CreateOrganizationData,
  UpdateOrganizationData,
  CreateUserData,
  InviteUserData,
} from "../types";

export type {
  CreateUserData,
  InviteUserData,
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
