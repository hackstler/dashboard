import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { listDocuments, deleteDocument } from "../api/knowledge";
import type { DocumentSource, DocumentContentType } from "../types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import {
  SearchIcon,
  FileTextIcon,
  LinkIcon,
  TypeIcon,
  TrashIcon,
  UploadIcon,
  DatabaseIcon,
} from "./ui/Icons";
import { formatDate } from "../utils/format";

const typeIcons: Record<DocumentContentType, typeof FileTextIcon> = {
  pdf: FileTextIcon,
  markdown: FileTextIcon,
  html: LinkIcon,
  code: FileTextIcon,
  text: TypeIcon,
  url: LinkIcon,
  youtube: LinkIcon,
};

const typeLabels: Record<DocumentContentType, string> = {
  pdf: "PDF",
  markdown: "Markdown",
  html: "HTML",
  code: "Code",
  text: "Text",
  url: "URL",
  youtube: "YouTube",
};

const statusVariant = {
  pending: "default" as const,
  processing: "warning" as const,
  indexed: "success" as const,
  failed: "error" as const,
};

export function KnowledgeList() {
  const { user, addToast, setActiveView } = useApp();
  const [docs, setDocs] = useState<DocumentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DocumentSource | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchDocs = useCallback(async () => {
    try {
      const filters: { contentType?: string; search?: string } = {};
      if (filterType !== "all") {
        filters.contentType = filterType;
      }
      if (search.trim()) {
        filters.search = search.trim();
      }
      // orgId filtering is enforced server-side from the JWT
      const data = await listDocuments(filters);
      setDocs(data);
    } catch {
      addToast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, [filterType, search, addToast]);

  useEffect(() => {
    setLoading(true);
    fetchDocs();
  }, [fetchDocs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTarget.id);
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      addToast("Document deleted", "success");
      setDeleteTarget(null);
    } catch {
      addToast("Failed to delete document", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Manage your indexed documents.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<UploadIcon size={16} />}
          onClick={() => setActiveView("knowledge-upload")}
        >
          Upload
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up stagger-1">
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<SearchIcon size={16} />}
          className="w-full sm:w-64"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-auto bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
        >
          <option value="all">All types</option>
          <option value="pdf">PDF</option>
          <option value="markdown">Markdown</option>
          <option value="html">HTML</option>
          <option value="text">Text</option>
          <option value="code">Code</option>
          <option value="url">URL</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 flex items-center gap-4"
            >
              <Skeleton className="w-8 h-8 rounded-[var(--radius-md)]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<DatabaseIcon size={40} />}
            title="No documents found"
            description={
              search || filterType !== "all"
                ? "Try adjusting your filters."
                : "Upload files, URLs, or text to get started."
            }
            action={
              !search && filterType === "all" ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UploadIcon size={16} />}
                  onClick={() => setActiveView("knowledge-upload")}
                >
                  Upload content
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {docs.map((doc, i) => {
            const IconComp = typeIcons[doc.contentType] ?? FileTextIcon;
            return (
              <div
                key={doc.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
              >
                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-surface-hi flex items-center justify-center shrink-0">
                  <IconComp size={16} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-bright font-medium truncate sm:max-w-none">
                    {doc.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-dim">
                      {typeLabels[doc.contentType]}
                    </span>
                    <span className="text-text-dim">·</span>
                    <span className="text-xs text-text-dim">
                      {formatDate(doc.createdAt)}
                    </span>
                    {doc.chunkCount != null && doc.chunkCount > 0 && (
                      <>
                        <span className="text-text-dim">·</span>
                        <span className="text-xs text-text-dim">
                          {doc.chunkCount} chunks
                        </span>
                      </>
                    )}
                    {isAdmin && doc.orgId && (
                      <>
                        <span className="text-text-dim">·</span>
                        <span className="text-xs text-text-dim font-mono">
                          {doc.orgId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant={statusVariant[doc.status]} dot>
                  {doc.status}
                </Badge>
                <button
                  onClick={() => setDeleteTarget(doc)}
                  className="btn-press text-text-dim hover:text-red transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] hover:bg-red-muted"
                  title="Delete"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Document"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete{" "}
            <span className="text-text-bright font-medium">
              {deleteTarget?.title}
            </span>
            ? This will remove the document and all its indexed chunks.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
