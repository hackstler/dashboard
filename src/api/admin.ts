import type { AdminUser, Organization } from "../types";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /admin/users
 */
export async function listUsers(filters?: {
  orgId?: string;
  search?: string;
}): Promise<{ items: AdminUser[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.orgId) params.set("orgId", filters.orgId);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  const url = `${BASE_URL}/admin/users${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to list users: ${res.status}`);
  return (await res.json()) as { items: AdminUser[]; total: number };
}

/**
 * POST /admin/users
 */
export async function createUser(data: {
  username: string;
  password: string;
  orgId: string;
  role: "admin" | "user";
}): Promise<AdminUser> {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to create user" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as AdminUser;
}

/**
 * DELETE /admin/users/:id
 */
export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to delete user" }))) as { message: string };
    throw new Error(err.message);
  }
}

/**
 * GET /admin/organizations
 */
export async function listOrganizations(): Promise<{ items: Organization[] }> {
  const res = await fetch(`${BASE_URL}/admin/organizations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to list organizations: ${res.status}`);
  return (await res.json()) as { items: Organization[] };
}

/**
 * POST /admin/organizations
 */
export async function createOrganization(data: {
  orgId: string;
  adminUsername: string;
  adminPassword: string;
}): Promise<{ orgId: string; admin: AdminUser }> {
  const res = await fetch(`${BASE_URL}/admin/organizations`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to create organization" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as { orgId: string; admin: AdminUser };
}

/**
 * DELETE /admin/organizations/:orgId
 */
export async function deleteOrganization(orgId: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/admin/organizations/${encodeURIComponent(orgId)}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to delete organization" }))) as { message: string };
    throw new Error(err.message);
  }
}
