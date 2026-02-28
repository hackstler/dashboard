import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import {
  listKnowledgeSources,
  deleteKnowledgeSource,
  listOrganizations,
} from "../api/knowledge";
import type { KnowledgeSource, Organization } from "../types";
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
import { formatDate, formatBytes } from "../utils/format";

const typeIcons = {
  file: FileTextIcon,
  url: LinkIcon,
  text: TypeIcon,
};

const statusVariant = {
  ready: "success" as const,
  processing: "warning" as const,
  error: "error" as const,
};

export function KnowledgeList() {
  const { user, addToast, setActiveView } = useApp();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeSource | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchSources = useCallback(async () => {
    try {
      const orgId = filterOrg !== "all" ? filterOrg : undefined;
      const data = await listKnowledgeSources(orgId);
      setSources(data);
    } catch {
      addToast("Failed to load knowledge sources", "error");
    } finally {
      setLoading(false);
    }
  }, [filterOrg, addToast]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  useEffect(() => {
    if (isAdmin) {
      listOrganizations()
        .then(setOrgs)
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteKnowledgeSource(deleteTarget.id);
      setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      addToast("Source deleted", "success");
      setDeleteTarget(null);
    } catch {
      addToast("Failed to delete source", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = sources.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-text-bright">
            Knowledge Base
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your indexed content sources.
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

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<SearchIcon size={16} />}
          className="w-64"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
        >
          <option value="all">All types</option>
          <option value="file">Files</option>
          <option value="url">URLs</option>
          <option value="text">Text</option>
        </select>
        {isAdmin && orgs.length > 0 && (
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="all">All organizations</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
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
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<DatabaseIcon size={40} />}
            title="No sources found"
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
          {filtered.map((source) => {
            const IconComp = typeIcons[source.type];
            return (
              <div
                key={source.id}
                className="flex items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] hover:border-border-hi transition-colors"
              >
                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-surface-hi flex items-center justify-center shrink-0">
                  <IconComp size={16} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-bright font-medium truncate">
                    {source.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-dim">
                      {formatDate(source.createdAt)}
                    </span>
                    {source.metadata.size != null && (
                      <>
                        <span className="text-text-dim">·</span>
                        <span className="text-xs text-text-dim">
                          {formatBytes(source.metadata.size)}
                        </span>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <span className="text-text-dim">·</span>
                        <span className="text-xs text-text-dim font-mono">
                          {source.orgId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant={statusVariant[source.status]} dot>
                  {source.status}
                </Badge>
                <button
                  onClick={() => setDeleteTarget(source)}
                  className="text-text-dim hover:text-red transition-colors cursor-pointer p-1"
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
        title="Delete Source"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete{" "}
            <span className="text-text-bright font-medium">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
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
