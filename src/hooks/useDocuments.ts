import { useState, useEffect, useCallback, useRef } from "react";
import {
  listDocuments,
  deleteDocument,
  uploadFile,
  uploadUrl,
  uploadText,
} from "../api/knowledge";
import type { DocumentSource, IngestResult } from "../types";

interface UseDocumentsOptions {
  contentType?: string;
  search?: string;
  pollingInterval?: number;
}

interface UseDocumentsReturn {
  documents: DocumentSource[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteDocument: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<IngestResult>;
  uploadUrl: (url: string, title?: string) => Promise<IngestResult>;
  uploadText: (content: string, name: string) => Promise<IngestResult>;
}

export function useDocuments(options: UseDocumentsOptions = {}): UseDocumentsReturn {
  const { contentType, search, pollingInterval } = options;
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async () => {
    try {
      const filters: { contentType?: string; search?: string } = {};
      if (contentType && contentType !== "all") filters.contentType = contentType;
      if (search?.trim()) filters.search = search.trim();
      const data = await listDocuments(filters);
      if (mountedRef.current) {
        setDocuments(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to load documents"
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [contentType, search]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    doFetch();

    if (!pollingInterval) {
      return () => {
        mountedRef.current = false;
      };
    }

    const id = setInterval(() => {
      if (!document.hidden) doFetch();
    }, pollingInterval);

    const onVisibility = () => {
      if (!document.hidden) doFetch();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [doFetch, pollingInterval]);

  const removeDocument = useCallback(
    async (id: string) => {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    },
    []
  );

  return {
    documents,
    loading,
    error,
    refetch: doFetch,
    deleteDocument: removeDocument,
    uploadFile,
    uploadUrl,
    uploadText,
  };
}
