import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useUsers } from "../../hooks/useUsers";
import { getAuthStrategy } from "../../api/auth";
import type { AdminUser } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { SearchIcon, TrashIcon, UsersIcon, PlusIcon } from "../ui/Icons";
import { formatDate } from "../../utils/format";

export function UsersPage() {
  const { user, addToast } = useApp();
  const strategy = getAuthStrategy();
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  const {
    users,
    loading,
    error,
    createUser,
    deleteUser,
  } = useUsers({ orgId: orgFilter, search });

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      if (strategy === "firebase") {
        await createUser({ email: newEmail, orgId: newOrgId, role: newRole });
      } else {
        await createUser({
          username: newUsername,
          password: newPassword,
          orgId: newOrgId,
          role: newRole,
        });
      }
      addToast(strategy === "firebase" ? "User invited" : "User created", "success");
      setShowCreate(false);
      resetCreateForm();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to create user",
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
      await deleteUser(deleteTarget.id);
      addToast("User deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to delete user",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const resetCreateForm = () => {
    setNewUsername("");
    setNewPassword("");
    setNewEmail("");
    setNewOrgId("");
    setNewRole("user");
  };

  const isCreateDisabled =
    strategy === "firebase"
      ? !newEmail || !newOrgId
      : !newUsername || !newPassword || !newOrgId;

  const isSelf = (u: AdminUser) => u.id === user?.id;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            Users
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Manage users across all organizations.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon size={16} />}
          onClick={() => setShowCreate(true)}
        >
          {strategy === "firebase" ? "Invite User" : "Create User"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up stagger-1">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<SearchIcon size={16} />}
          className="w-full sm:w-64"
        />
        <Input
          placeholder="Filter by orgId..."
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-md)] text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 flex items-center gap-4"
            >
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UsersIcon size={40} />}
            title="No users found"
            description={
              search || orgFilter
                ? "Try adjusting your filters."
                : strategy === "firebase"
                  ? "Invite your first user to get started."
                  : "Create your first user to get started."
            }
            action={
              !search && !orgFilter ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<PlusIcon size={16} />}
                  onClick={() => setShowCreate(true)}
                >
                  Create User
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => (
            <div
              key={u.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-xs font-semibold text-accent select-none shrink-0">
                {u.email?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium truncate">
                  {u.email}
                  {isSelf(u) && (
                    <span className="text-xs text-text-dim ml-2">(you)</span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-dim font-mono">
                    {u.orgId}
                  </span>
                  <span className="text-text-dim">&middot;</span>
                  <span className="text-xs text-text-dim">
                    {formatDate(u.createdAt)}
                  </span>
                </div>
              </div>
              <Badge variant={u.role === "admin" ? "info" : "default"}>
                {u.role}
              </Badge>
              <button
                onClick={() => {
                  if (isSelf(u)) {
                    addToast("Cannot delete your own account", "error");
                    return;
                  }
                  setDeleteTarget(u);
                }}
                className={`btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] ${
                  isSelf(u)
                    ? "text-text-dim/30 cursor-not-allowed"
                    : "text-text-dim hover:text-red hover:bg-red-muted"
                }`}
                title={isSelf(u) ? "Cannot delete yourself" : "Delete"}
                disabled={isSelf(u)}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetCreateForm();
        }}
        title={strategy === "firebase" ? "Invite User" : "Create User"}
      >
        <div className="space-y-4">
          {strategy === "firebase" ? (
            <Input
              label="Email"
              type="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          ) : (
            <>
              <Input
                label="Username"
                placeholder="john@example.com"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </>
          )}
          <Input
            label="Organization ID"
            placeholder="my-org"
            value={newOrgId}
            onChange={(e) => setNewOrgId(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Role</label>
            <select
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as "admin" | "user")
              }
              className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
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
              disabled={isCreateDisabled}
            >
              {strategy === "firebase" ? "Invite" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete{" "}
            <span className="text-text-bright font-medium">
              {deleteTarget?.email}
            </span>
            ? This will also delete all their conversations and messages.
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
