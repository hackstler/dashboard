import { apiRequest } from "./http";
import type {
  CatalogData,
  CatalogItemData,
  CreateCatalogData,
  UpdateCatalogData,
  CreateItemData,
  UpdateItemData,
} from "../types";

export type {
  CatalogData,
  CatalogItemData,
  CreateCatalogData,
  UpdateCatalogData,
  CreateItemData,
  UpdateItemData,
} from "../types";

// ── Catalogs ────────────────────────────────────────────────────────────────

export async function listCatalogs(): Promise<{
  items: CatalogData[];
  total: number;
}> {
  return apiRequest("/admin/catalogs");
}

export async function getCatalog(id: string): Promise<CatalogData> {
  return apiRequest(`/admin/catalogs/${encodeURIComponent(id)}`);
}

export async function createCatalog(
  data: CreateCatalogData
): Promise<CatalogData> {
  return apiRequest("/admin/catalogs", { method: "POST", body: data });
}

export async function updateCatalog(
  id: string,
  data: UpdateCatalogData
): Promise<CatalogData> {
  return apiRequest(`/admin/catalogs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteCatalog(id: string): Promise<void> {
  await apiRequest(`/admin/catalogs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function activateCatalog(id: string): Promise<CatalogData> {
  return apiRequest(
    `/admin/catalogs/${encodeURIComponent(id)}/activate`,
    { method: "POST" }
  );
}

// ── Items ───────────────────────────────────────────────────────────────────

export async function listItems(
  catalogId: string
): Promise<{ items: CatalogItemData[]; total: number }> {
  return apiRequest(
    `/admin/catalogs/${encodeURIComponent(catalogId)}/items`
  );
}

export async function createItem(
  catalogId: string,
  data: CreateItemData
): Promise<CatalogItemData> {
  return apiRequest(
    `/admin/catalogs/${encodeURIComponent(catalogId)}/items`,
    { method: "POST", body: data }
  );
}

export async function updateItem(
  catalogId: string,
  itemId: string,
  data: UpdateItemData
): Promise<CatalogItemData> {
  return apiRequest(
    `/admin/catalogs/${encodeURIComponent(catalogId)}/items/${encodeURIComponent(itemId)}`,
    { method: "PATCH", body: data }
  );
}

export async function deleteItem(
  catalogId: string,
  itemId: string
): Promise<void> {
  await apiRequest(
    `/admin/catalogs/${encodeURIComponent(catalogId)}/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE" }
  );
}
