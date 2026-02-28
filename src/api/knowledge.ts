import type { DocumentSource, IngestResult } from "../types";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * List documents. Optionally filter by orgId, contentType, or title search.
 * GET /documents?orgId=xxx&contentType=pdf&search=term
 */
export async function listDocuments(filters?: {
  orgId?: string;
  contentType?: string;
  search?: string;
}): Promise<DocumentSource[]> {
  const params = new URLSearchParams();
  if (filters?.orgId) params.set("orgId", filters.orgId);
  if (filters?.contentType) params.set("contentType", filters.contentType);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  const url = `${BASE_URL}/documents${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to list documents: ${res.status}`);
  const json = (await res.json()) as { items: DocumentSource[]; total: number };
  return json.items;
}

/**
 * Upload a file for ingestion.
 * POST /ingest (multipart/form-data)
 */
export async function uploadFile(file: File): Promise<IngestResult> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" })) as { error: string };
    throw new Error(err.error);
  }
  return (await res.json()) as IngestResult;
}

/**
 * Ingest a URL.
 * POST /ingest (application/json)
 */
export async function uploadUrl(
  url: string,
  title?: string
): Promise<IngestResult> {
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "URL ingestion failed" })) as { error: string };
    throw new Error(err.error);
  }
  return (await res.json()) as IngestResult;
}

/**
 * Upload text content as a .txt file via the file upload endpoint.
 * The backend has no dedicated text endpoint, so we create a Blob.
 */
export async function uploadText(
  content: string,
  name: string
): Promise<IngestResult> {
  const blob = new Blob([content], { type: "text/plain" });
  const filename = name.endsWith(".txt") ? name : `${name}.txt`;
  const file = new File([blob], filename, { type: "text/plain" });
  return uploadFile(file);
}

/**
 * Delete a document and all its chunks.
 * DELETE /documents/:id
 */
export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${res.status}`);
}
