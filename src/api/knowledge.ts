import { apiRequest, apiUpload } from "./http";
import type { DocumentSource, IngestResult } from "../types";

export async function listDocuments(filters?: {
  contentType?: string;
  search?: string;
}): Promise<DocumentSource[]> {
  const params = new URLSearchParams();
  if (filters?.contentType) params.set("contentType", filters.contentType);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  const json = await apiRequest<{ items: DocumentSource[]; total: number }>(
    `/documents${qs ? `?${qs}` : ""}`
  );
  return json.items;
}

export async function uploadFile(file: File): Promise<IngestResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload("/ingest", formData);
}

export async function uploadUrl(
  url: string,
  title?: string
): Promise<IngestResult> {
  return apiRequest("/ingest", {
    method: "POST",
    body: { url, title },
  });
}

export async function uploadText(
  content: string,
  name: string
): Promise<IngestResult> {
  const blob = new Blob([content], { type: "text/plain" });
  const filename = name.endsWith(".txt") ? name : `${name}.txt`;
  const file = new File([blob], filename, { type: "text/plain" });
  return uploadFile(file);
}

export async function deleteDocument(id: string): Promise<void> {
  await apiRequest(`/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
