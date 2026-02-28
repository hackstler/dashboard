import type { KnowledgeSource, Organization } from "../types";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listKnowledgeSources(
  orgId?: string
): Promise<KnowledgeSource[]> {
  const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
  const res = await fetch(`${BASE_URL}/knowledge${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to list knowledge sources: ${res.status}`);
  const json = (await res.json()) as { data: KnowledgeSource[] };
  return json.data;
}

export async function uploadFile(file: File): Promise<KnowledgeSource> {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}/knowledge/upload/file`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload file: ${res.status}`);
  const json = (await res.json()) as { data: KnowledgeSource };
  return json.data;
}

export async function uploadUrl(
  url: string,
  name?: string
): Promise<KnowledgeSource> {
  const res = await fetch(`${BASE_URL}/knowledge/upload/url`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ url, name }),
  });
  if (!res.ok) throw new Error(`Failed to upload URL: ${res.status}`);
  const json = (await res.json()) as { data: KnowledgeSource };
  return json.data;
}

export async function uploadText(
  content: string,
  name: string
): Promise<KnowledgeSource> {
  const res = await fetch(`${BASE_URL}/knowledge/upload/text`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ content, name }),
  });
  if (!res.ok) throw new Error(`Failed to upload text: ${res.status}`);
  const json = (await res.json()) as { data: KnowledgeSource };
  return json.data;
}

export async function deleteKnowledgeSource(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/knowledge/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete knowledge source: ${res.status}`);
}

export async function listOrganizations(): Promise<Organization[]> {
  const res = await fetch(`${BASE_URL}/organizations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to list organizations: ${res.status}`);
  const json = (await res.json()) as { data: Organization[] };
  return json.data;
}
