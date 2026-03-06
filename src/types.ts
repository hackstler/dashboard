// ── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  orgId: string;
  role: "admin" | "user";
}

export type AuthStrategyType = "password" | "firebase";

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; orgId: string; role: string };
}

export type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User };

// ── Navigation ──────────────────────────────────────────────────────────────

export type ActiveView =
  | "overview"
  | "whatsapp"
  | "knowledge-upload"
  | "knowledge-list"
  | "users"
  | "organizations"
  | "catalogs"
  | "settings";

// ── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  orgId: string;
  role: string;
  createdAt: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  orgId: string;
  role: "admin" | "user";
}

export interface InviteUserData {
  email: string;
  orgId: string;
  role: "admin" | "user";
}

// ── Organizations ───────────────────────────────────────────────────────────

export interface Organization {
  orgId: string;
  name: string | null;
  userCount: number;
  docCount: number;
  createdAt: string | null;
}

export interface OrganizationDetail {
  id: string;
  orgId: string;
  slug: string | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  nif: string | null;
  logo: string | null;
  vatRate: number | null;
  currency: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationData {
  orgId: string;
  adminUsername: string;
  adminPassword: string;
  slug?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  nif?: string;
  logo?: string;
  vatRate?: number;
  currency?: string;
}

export interface UpdateOrganizationData {
  slug?: string | null;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  nif?: string | null;
  logo?: string | null;
  vatRate?: number | null;
  currency?: string;
}

// ── Channels ────────────────────────────────────────────────────────────────

export interface WhatsAppStatus {
  status: "not_enabled" | "pending" | "disconnected" | "qr" | "connected";
  phone: string | null;
  updatedAt?: string;
}

// ── Google ───────────────────────────────────────────────────────────────────

export interface GoogleConnectionStatus {
  connected: boolean;
  scopes: string[];
}

// ── Catalogs ────────────────────────────────────────────────────────────────

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

// ── Documents ───────────────────────────────────────────────────────────────

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

// ── UI ──────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
