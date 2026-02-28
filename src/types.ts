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
  | "knowledge-list"
  | "users"
  | "organizations";

export interface AdminUser {
  id: string;
  email: string;
  orgId: string;
  role: string;
  createdAt: string;
}

export interface Organization {
  orgId: string;
  userCount: number;
  docCount: number;
  createdAt: string | null;
}

export type DocumentContentType =
  | "pdf"
  | "markdown"
  | "html"
  | "code"
  | "text"
  | "url"
  | "youtube";

export type DocumentStatus = "pending" | "processing" | "indexed" | "failed";

export interface DocumentSource {
  id: string;
  orgId: string | null;
  topicId: string | null;
  title: string;
  source: string;
  contentType: DocumentContentType;
  status: DocumentStatus;
  chunkCount: number | null;
  metadata: {
    size?: number;
    pageCount?: number;
    author?: string;
    language?: string;
    tags?: string[];
    error?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
  indexedAt: string | null;
}

export interface IngestResult {
  documentId: string;
  status: "indexed" | "failed";
  chunkCount: number;
  error?: string;
}
