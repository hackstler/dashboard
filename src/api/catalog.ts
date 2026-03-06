const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface CatalogData {
  id: string;
  orgId: string;
  name: string;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItemData {
  id: string;
  catalogId: string;
  code: number;
  name: string;
  description: string | null;
  category: string | null;
  pricePerUnit: string;
  unit: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCatalogData {
  name: string;
  effectiveDate: string;
  isActive?: boolean;
}

export interface UpdateCatalogData {
  name?: string;
  effectiveDate?: string;
  isActive?: boolean;
}

export interface CreateItemData {
  code?: number;
  name: string;
  description?: string | null;
  category?: string | null;
  pricePerUnit: number;
  unit: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateItemData {
  code?: number;
  name?: string;
  description?: string | null;
  category?: string | null;
  pricePerUnit?: number;
  unit?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ── Catalogs ────────────────────────────────────────────────────────────────

export async function listCatalogs(): Promise<{ items: CatalogData[]; total: number }> {
  const res = await fetch(`${BASE_URL}/admin/catalogs`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to list catalogs: ${res.status}`);
  return (await res.json()) as { items: CatalogData[]; total: number };
}

export async function getCatalog(id: string): Promise<CatalogData> {
  const res = await fetch(`${BASE_URL}/admin/catalogs/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to get catalog: ${res.status}`);
  return (await res.json()) as CatalogData;
}

export async function createCatalog(data: CreateCatalogData): Promise<CatalogData> {
  const res = await fetch(`${BASE_URL}/admin/catalogs`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to create catalog" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as CatalogData;
}

export async function updateCatalog(id: string, data: UpdateCatalogData): Promise<CatalogData> {
  const res = await fetch(`${BASE_URL}/admin/catalogs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to update catalog" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as CatalogData;
}

export async function deleteCatalog(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/catalogs/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to delete catalog" }))) as { message: string };
    throw new Error(err.message);
  }
}

export async function activateCatalog(id: string): Promise<CatalogData> {
  const res = await fetch(`${BASE_URL}/admin/catalogs/${encodeURIComponent(id)}/activate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to activate catalog" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as CatalogData;
}

// ── Items ───────────────────────────────────────────────────────────────────

export async function listItems(catalogId: string): Promise<{ items: CatalogItemData[]; total: number }> {
  const res = await fetch(
    `${BASE_URL}/admin/catalogs/${encodeURIComponent(catalogId)}/items`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`Failed to list items: ${res.status}`);
  return (await res.json()) as { items: CatalogItemData[]; total: number };
}

export async function createItem(catalogId: string, data: CreateItemData): Promise<CatalogItemData> {
  const res = await fetch(
    `${BASE_URL}/admin/catalogs/${encodeURIComponent(catalogId)}/items`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to create item" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as CatalogItemData;
}

export async function updateItem(
  catalogId: string,
  itemId: string,
  data: UpdateItemData,
): Promise<CatalogItemData> {
  const res = await fetch(
    `${BASE_URL}/admin/catalogs/${encodeURIComponent(catalogId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to update item" }))) as { message: string };
    throw new Error(err.message);
  }
  return (await res.json()) as CatalogItemData;
}

export async function deleteItem(catalogId: string, itemId: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/admin/catalogs/${encodeURIComponent(catalogId)}/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Failed to delete item" }))) as { message: string };
    throw new Error(err.message);
  }
}
