export interface User {
  id: string;
  username: string;
  orgId: string;
  role: "admin" | "user";
}

export type ActiveView =
  | "overview"
  | "whatsapp"
  | "knowledge-upload"
  | "knowledge-list";

export interface KnowledgeSource {
  id: string;
  orgId: string;
  type: "file" | "url" | "text";
  name: string;
  status: "processing" | "ready" | "error";
  metadata: {
    size?: number;
    mimeType?: string;
    url?: string;
    charCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
}
