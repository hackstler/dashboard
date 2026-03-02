import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useOrganizations } from "../../hooks/useOrganizations";
import type { Organization } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import {
  BuildingIcon,
  TrashIcon,
  PlusIcon,
  UsersIcon,
  DatabaseIcon,
  AlertCircleIcon,
} from "../ui/Icons";
import { formatDate } from "../../utils/format";

export function OrganizationsPage() {
  const { user, addToast } = useApp();
  const {
    organizations: orgs,
    loading,
    error,
    createOrganization,
    deleteOrganization,
  } = useOrganizations();

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOrgId, setNewOrgId] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createOrganization({
        orgId: newOrgId,
        adminUsername: newAdminUsername,
        adminPassword: newAdminPassword,
      });
      addToast("Organization created", "success");
      setShowCreate(false);
      resetCreateForm();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to create organization",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOrganization(deleteTarget.orgId);
      addToast("Organization deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to delete organization",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const resetCreateForm = () => {
    setNewOrgId("");
    setNewAdminUsername("");
    setNewAdminPassword("");
  };

  const isOwnOrg = (org: Organization) => org.orgId === user?.orgId;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            Organizations
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Manage tenant organizations.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon size={16} />}
          onClick={() => setShowCreate(true)}
        >
          Create Organization
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-md)] text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
      ) : orgs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BuildingIcon size={40} />}
            title="No organizations found"
            description="Create your first organization to get started."
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={16} />}
                onClick={() => setShowCreate(true)}
              >
                Create Organization
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {orgs.map((org, i) => (
            <div
              key={org.orgId}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-surface-hi flex items-center justify-center shrink-0">
                <BuildingIcon size={16} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium font-mono truncate">
                  {org.orgId}
                  {isOwnOrg(org) && (
                    <span className="text-xs text-text-dim ml-2 font-sans">
                      (yours)
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {org.createdAt && (
                    <span className="text-xs text-text-dim">
                      {formatDate(org.createdAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <UsersIcon size={14} />
                  {org.userCount}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <DatabaseIcon size={14} />
                  {org.docCount}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isOwnOrg(org)) {
                    addToast(
                      "Cannot delete your own organization",
                      "error"
                    );
                    return;
                  }
                  setDeleteTarget(org);
                }}
                className={`btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] ${
                  isOwnOrg(org)
                    ? "text-text-dim/30 cursor-not-allowed"
                    : "text-text-dim hover:text-red hover:bg-red-muted"
                }`}
                title={
                  isOwnOrg(org)
                    ? "Cannot delete your own organization"
                    : "Delete"
                }
                disabled={isOwnOrg(org)}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetCreateForm();
        }}
        title="Create Organization"
      >
        <div className="space-y-4">
          <Input
            label="Organization ID"
            placeholder="my-company"
            value={newOrgId}
            onChange={(e) => setNewOrgId(e.target.value)}
          />
          <Input
            label="Admin Username"
            placeholder="admin@my-company.com"
            value={newAdminUsername}
            onChange={(e) => setNewAdminUsername(e.target.value)}
          />
          <Input
            label="Admin Password"
            type="password"
            placeholder="Min 8 characters"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowCreate(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              loading={creating}
              disabled={!newOrgId || !newAdminUsername || !newAdminPassword}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Organization Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Organization"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-muted/50 border border-red/20 rounded-[var(--radius-md)]">
            <AlertCircleIcon size={18} className="text-red shrink-0 mt-0.5" />
            <p className="text-sm text-red">
              This action is irreversible. All users, documents, topics, and
              WhatsApp sessions belonging to{" "}
              <span className="font-mono font-semibold">
                {deleteTarget?.orgId}
              </span>{" "}
              will be permanently deleted.
            </p>
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to delete organization{" "}
            <span className="text-text-bright font-medium font-mono">
              {deleteTarget?.orgId}
            </span>
            ?
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
              Delete Organization
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
