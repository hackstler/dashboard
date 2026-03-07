import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useUsers } from "../../hooks/useUsers";
import { getAuthStrategy } from "../../api/auth";
import { createInvitation, listInvitations, revokeInvitation } from "../../api/admin";
import type { AdminUser, Invitation } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { SearchIcon, TrashIcon, UsersIcon, PlusIcon, EditIcon } from "../ui/Icons";
import { formatDate } from "../../utils/format";

export function UsersPage() {
  const { user, addToast } = useApp();
  const { can } = usePermissions();
  const strategy = getAuthStrategy();
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  const {
    users,
    loading,
    error,
    createUser,
    editUser,
    deleteUser,
  } = useUsers({ orgId: orgFilter, search });

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user" | "super_admin">("user");

  // Edit modal
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user" | "super_admin">("user");
  const [editPassword, setEditPassword] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Invitation state
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchInvitations = useCallback(async () => {
    if (!can("view_org_users")) return;
    try {
      const data = await listInvitations();
      setInvitations(data.items.filter((i) => !i.usedAt));
    } catch {
      // silently fail
    }
  }, [can]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      if (strategy === "firebase") {
        await createUser({
          email: newEmail,
          orgId: newOrgId,
          role: newRole,
        });
      } else {
        await createUser({
          email: newEmail,
          password: newPassword,
          name: newName || undefined,
          surname: newSurname || undefined,
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

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      const data: { email?: string; name?: string; surname?: string; role?: string; password?: string } = {};
      if (editName !== (editTarget.name ?? "")) data.name = editName;
      if (editSurname !== (editTarget.surname ?? "")) data.surname = editSurname;
      if (editEmail !== editTarget.email) data.email = editEmail;
      if (editRole !== editTarget.role) data.role = editRole;
      if (editPassword) data.password = editPassword;
      await editUser(editTarget.id, data);
      addToast("User updated", "success");
      setEditTarget(null);
      resetEditForm();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update user",
        "error"
      );
    } finally {
      setEditing(false);
    }
  };

  const openEditModal = (u: AdminUser) => {
    setEditTarget(u);
    setEditName(u.name ?? "");
    setEditSurname(u.surname ?? "");
    setEditEmail(u.email);
    setEditRole(u.role as "admin" | "user" | "super_admin");
    setEditPassword("");
  };

  const resetEditForm = () => {
    setEditName("");
    setEditSurname("");
    setEditEmail("");
    setEditRole("user");
    setEditPassword("");
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      const result = await createInvitation({
        email: inviteEmail || undefined,
        role: inviteRole,
      });
      setInviteUrl(result.inviteUrl);
      addToast("Invitación creada", "success");
      fetchInvitations();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Error al crear invitación",
        "error",
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await revokeInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      addToast("Invitación revocada", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Error al revocar invitación",
        "error",
      );
    }
  };

  const handleCopyInviteUrl = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCreateForm = () => {
    setNewName("");
    setNewSurname("");
    setNewEmail("");
    setNewPassword("");
    setNewOrgId("");
    setNewRole("user");
  };

  const isCreateDisabled =
    strategy === "firebase"
      ? !newEmail || !newOrgId
      : !newEmail || !newPassword || !newOrgId;

  const isSelf = (u: AdminUser) => u.id === user?.id;

  const displayName = (u: AdminUser) =>
    u.name && u.surname ? `${u.name} ${u.surname}` : u.name ?? u.email;

  const avatarInitial = (u: AdminUser) =>
    (u.name ?? u.email ?? "?").charAt(0).toUpperCase();

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
        {can("create_org_users") && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={() => {
                setShowInvite(true);
                setInviteUrl(null);
                setInviteEmail("");
                setInviteRole("user");
                setCopied(false);
              }}
            >
              Invite via Link
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={() => setShowCreate(true)}
            >
              {strategy === "firebase" ? "Invite User" : "Create User"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up stagger-1">
        <Input
          placeholder="Search by name or email..."
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
                {avatarInitial(u)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium truncate">
                  {displayName(u)}
                  {isSelf(u) && (
                    <span className="text-xs text-text-dim ml-2">(you)</span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-dim">
                    {u.email}
                  </span>
                  <span className="text-text-dim">&middot;</span>
                  <span className="text-xs text-text-dim font-mono">
                    {u.orgId}
                  </span>
                  <span className="text-text-dim">&middot;</span>
                  <span className="text-xs text-text-dim">
                    {formatDate(u.createdAt)}
                  </span>
                </div>
              </div>
              <Badge variant={u.role === "admin" ? "info" : u.role === "super_admin" ? "info" : "default"}>
                {u.role}
              </Badge>
              {can("edit_org_users") && (
                <button
                  onClick={() => openEditModal(u)}
                  className="btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] text-text-dim hover:text-accent hover:bg-accent/10"
                  title="Edit"
                >
                  <EditIcon size={16} />
                </button>
              )}
              {can("delete_org_users") && (
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
              )}
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              placeholder="First name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Surname"
              placeholder="Last name"
              value={newSurname}
              onChange={(e) => setNewSurname(e.target.value)}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {strategy !== "firebase" && (
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
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
                setNewRole(e.target.value as "admin" | "user" | "super_admin")
              }
              className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
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

      {/* Edit User Modal */}
      <Modal
        open={editTarget !== null}
        onClose={() => {
          setEditTarget(null);
          resetEditForm();
        }}
        title="Edit User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              placeholder="First name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              label="Surname"
              placeholder="Last name"
              value={editSurname}
              onChange={(e) => setEditSurname(e.target.value)}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Role</label>
            <select
              value={editRole}
              onChange={(e) =>
                setEditRole(e.target.value as "admin" | "user" | "super_admin")
              }
              className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <Input
            label="Password (leave blank to keep current)"
            type="password"
            placeholder="New password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditTarget(null);
                resetEditForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEdit}
              loading={editing}
              disabled={!editEmail}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mt-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-text-bright mb-4">
            Invitaciones pendientes
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-bright font-medium truncate">
                    {inv.email ?? "Sin email"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-dim">
                      Expira: {formatDate(inv.expiresAt)}
                    </span>
                  </div>
                </div>
                <Badge variant="default">{inv.role}</Badge>
                <button
                  onClick={() => handleRevokeInvitation(inv.id)}
                  className="btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] text-text-dim hover:text-red hover:bg-red-muted"
                  title="Revocar"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              {deleteTarget ? displayName(deleteTarget) : ""}
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

      {/* Invite via Link Modal */}
      <Modal
        open={showInvite}
        onClose={() => {
          setShowInvite(false);
          setInviteUrl(null);
        }}
        title="Invitar usuario via link"
      >
        <div className="space-y-4">
          {inviteUrl ? (
            <>
              <p className="text-sm text-text-muted">
                Comparte este enlace con el usuario:
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-surface border border-border text-text text-xs px-3 py-2 rounded-[var(--radius-md)] font-mono truncate"
                />
                <Button
                  variant={copied ? "primary" : "secondary"}
                  size="sm"
                  onClick={handleCopyInviteUrl}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowInvite(false);
                    setInviteUrl(null);
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Input
                label="Email (opcional)"
                type="email"
                placeholder="usuario@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">Rol</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "user")}
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
                  onClick={() => setShowInvite(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleInvite}
                  loading={inviting}
                >
                  Crear invitación
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
