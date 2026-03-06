import { useEffect, useCallback, useRef } from "react";
import { usePolling } from "./usePolling";
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
  const { contentType, search, pollingInterval = 30000 } = options;

  const fetcher = useCallback(async () => {
    const filters: { contentType?: string; search?: string } = {};
    if (contentType && contentType !== "all") filters.contentType = contentType;
    if (search?.trim()) filters.search = search.trim();
    return listDocuments(filters);
  }, [contentType, search]);

  const { data, loading, error, refetch } = usePolling<DocumentSource[]>(
    fetcher,
    pollingInterval
  );

  // Re-fetch when filters change (skip initial mount — usePolling handles that)
  const isInitialRef = useRef(true);
  useEffect(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }
    refetch();
  }, [contentType, search, refetch]);

  const removeDocument = useCallback(
    async (id: string) => {
      await deleteDocument(id);
      refetch();
    },
    [refetch]
  );

  return {
    documents: data ?? [],
    loading,
    error,
    refetch,
    deleteDocument: removeDocument,
    uploadFile,
    uploadUrl,
    uploadText,
  };
}
