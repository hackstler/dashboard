import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { useOrganizations } from "../../hooks/useOrganizations";
import type { Organization, OrganizationDetail } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
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
  EditIcon,
  ArrowLeftIcon,
  SaveIcon,
  ImageIcon,
} from "../ui/Icons";
import { formatDate } from "../../utils/format";

// ── Organization Edit View ────────────────────────────────────────────────────

interface OrgEditViewProps {
  orgId: string;
  isOwnOrg: boolean;
  onBack: () => void;
  getOrganization: (orgId: string) => Promise<OrganizationDetail>;
  updateOrganization: (
    orgId: string,
    data: Record<string, unknown>
  ) => Promise<OrganizationDetail>;
}

function OrgEditView({
  orgId,
  isOwnOrg,
  onBack,
  getOrganization,
  updateOrganization,
}: OrgEditViewProps) {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [vatRate, setVatRate] = useState("");
  const [currency, setCurrency] = useState("€");
  const [logo, setLogo] = useState<string | null>(null);

  const loadOrg = useCallback(async () => {
    setLoading(true);
    try {
      const org = await getOrganization(orgId);
      setName(org.name ?? "");
      setSlug(org.slug ?? "");
      setAddress(org.address ?? "");
      setPhone(org.phone ?? "");
      setEmail(org.email ?? "");
      setNif(org.nif ?? "");
      setVatRate(org.vatRate ? String(parseFloat(org.vatRate) * 100) : "");
      setCurrency(org.currency ?? "€");
      setLogo(org.logo);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to load organization",
        "error"
      );
      onBack();
    } finally {
      setLoading(false);
    }
  }, [orgId, getOrganization, addToast, onBack]);

  useEffect(() => {
    loadOrg();
  }, [loadOrg]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const vatNum = vatRate ? parseFloat(vatRate) / 100 : null;
      await updateOrganization(orgId, {
        name: name || null,
        slug: slug || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        nif: nif || null,
        vatRate: vatNum,
        currency: currency || "€",
        logo,
      });
      addToast("Organization updated", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      addToast("Logo must be under 1.5 MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-8 h-8 rounded-[var(--radius-md)]" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-press p-2 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface-hover transition-all cursor-pointer"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
              {name || orgId}
            </h1>
            <p className="text-sm text-text-muted mt-1 font-mono">{orgId}</p>
          </div>
        </div>
        {isOwnOrg && (
          <Button
            variant="primary"
            size="sm"
            icon={<SaveIcon size={16} />}
            onClick={handleSave}
            loading={saving}
          >
            Save Changes
          </Button>
        )}
      </div>

      {!isOwnOrg && (
        <div className="mb-6 px-4 py-3 bg-yellow/10 border border-yellow/20 rounded-[var(--radius-md)] text-sm text-yellow">
          You can only edit your own organization.
        </div>
      )}

      <div className="space-y-6">
        {/* Logo Section */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-text-bright mb-4">Logo</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-surface-hi border border-border flex items-center justify-center overflow-hidden shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImageIcon size={28} className="text-text-dim" />
              )}
            </div>
            <div className="space-y-2">
              <label
                className={`btn-press inline-flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border transition-all ${
                  isOwnOrg
                    ? "bg-surface-hi hover:bg-surface-hover text-text cursor-pointer"
                    : "text-text-dim cursor-not-allowed opacity-50"
                }`}
              >
                <ImageIcon size={14} />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={!isOwnOrg}
                />
              </label>
              {logo && isOwnOrg && (
                <button
                  onClick={() => setLogo(null)}
                  className="block text-xs text-text-dim hover:text-red transition-colors cursor-pointer"
                >
                  Remove logo
                </button>
              )}
              <p className="text-xs text-text-dim">PNG, JPG up to 1.5 MB</p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            Company Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label="Slug"
              placeholder="acme-corp"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              disabled={!isOwnOrg}
            />
            <Input
              label="NIF / Tax ID"
              placeholder="B12345678"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label="Email"
              type="email"
              placeholder="info@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+34 600 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isOwnOrg}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Address"
                placeholder="123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isOwnOrg}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-2">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            Billing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="VAT Rate (%)"
              type="number"
              placeholder="21"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label="Currency"
              placeholder="€"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={!isOwnOrg}
            />
          </div>
        </div>

        {/* Save button at bottom for mobile */}
        {isOwnOrg && (
          <div className="flex justify-end pt-2 pb-4">
            <Button
              variant="primary"
              size="sm"
              icon={<SaveIcon size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Organizations Page ───────────────────────────────────────────────────

export function OrganizationsPage() {
  const { user, addToast } = useApp();
  const {
    organizations: orgs,
    loading,
    error,
    createOrganization,
    deleteOrganization,
    getOrganization: getOrg,
    updateOrganization: updateOrg,
  } = useOrganizations();

  // Internal view: list or edit
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOrgId, setNewOrgId] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  // Optional create fields
  const [showOptional, setShowOptional] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNif, setNewNif] = useState("");
  const [newVatRate, setNewVatRate] = useState("");
  const [newCurrency, setNewCurrency] = useState("");

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
        ...(newName && { name: newName }),
        ...(newSlug && { slug: newSlug }),
        ...(newAddress && { address: newAddress }),
        ...(newPhone && { phone: newPhone }),
        ...(newEmail && { email: newEmail }),
        ...(newNif && { nif: newNif }),
        ...(newVatRate && { vatRate: parseFloat(newVatRate) / 100 }),
        ...(newCurrency && { currency: newCurrency }),
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
    setShowOptional(false);
    setNewName("");
    setNewSlug("");
    setNewAddress("");
    setNewPhone("");
    setNewEmail("");
    setNewNif("");
    setNewVatRate("");
    setNewCurrency("");
  };

  const isOwnOrg = (org: Organization) => org.orgId === user?.orgId;

  // ── Edit view ─────────────────────────────────────────────────────────────

  if (editingOrgId) {
    return (
      <OrgEditView
        orgId={editingOrgId}
        isOwnOrg={editingOrgId === user?.orgId}
        onBack={() => setEditingOrgId(null)}
        getOrganization={getOrg}
        updateOrganization={updateOrg}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

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
                <button
                  onClick={() => setEditingOrgId(org.orgId)}
                  className="text-sm text-text-bright font-medium font-mono truncate hover:text-accent transition-colors cursor-pointer text-left"
                >
                  {org.orgId}
                  {isOwnOrg(org) && (
                    <span className="text-xs text-text-dim ml-2 font-sans">
                      (yours)
                    </span>
                  )}
                </button>
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
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingOrgId(org.orgId)}
                  className="btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] text-text-dim hover:text-accent hover:bg-accent/10"
                  title="Edit"
                >
                  <EditIcon size={16} />
                </button>
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

          {/* Collapsible optional fields */}
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors cursor-pointer w-full"
          >
            <span
              className="transition-transform duration-200 inline-block"
              style={{ transform: showOptional ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ▸
            </span>
            Company details (optional)
          </button>

          {showOptional && (
            <div className="space-y-3 pl-1 border-l-2 border-border ml-1 animate-fade-in">
              <div className="pl-3 space-y-3">
                <Input
                  label="Company Name"
                  placeholder="Acme Corp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  label="Slug"
                  placeholder="acme-corp"
                  value={newSlug}
                  onChange={(e) =>
                    setNewSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="NIF / Tax ID"
                    placeholder="B12345678"
                    value={newNif}
                    onChange={(e) => setNewNif(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="info@acme.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
                <Input
                  label="Address"
                  placeholder="123 Main St, City"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="VAT Rate (%)"
                    type="number"
                    placeholder="21"
                    value={newVatRate}
                    onChange={(e) => setNewVatRate(e.target.value)}
                  />
                  <Input
                    label="Currency"
                    placeholder="€"
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

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
