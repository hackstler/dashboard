import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { getWhatsappConnections, revokeWhatsappConnection } from "../../api/admin";
import type { WhatsAppConnection } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Modal } from "../ui/Modal";
import { MessageCircleIcon } from "../ui/Icons";

function statusBadge(status: string) {
  switch (status) {
    case "connected":
      return <Badge variant="success">Connected</Badge>;
    case "qr":
    case "pending":
      return <Badge variant="warning">{status === "qr" ? "Awaiting scan" : "Pending"}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export function WhatsAppConnectionsPage() {
  const { user, addToast } = useApp();
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<WhatsAppConnection | null>(null);

  const isSuperAdmin = user?.role === "super_admin";

  const fetchConnections = useCallback(async () => {
    try {
      const data = await getWhatsappConnections();
      setConnections(data);
    } catch {
      addToast("Failed to load WhatsApp connections", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 10_000);
    return () => clearInterval(interval);
  }, [fetchConnections]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(revokeTarget.userId);
    try {
      await revokeWhatsappConnection(revokeTarget.userId);
      addToast("WhatsApp session revoked", "success");
      setRevokeTarget(null);
      await fetchConnections();
    } catch {
      addToast("Failed to revoke session", "error");
    } finally {
      setRevoking(null);
    }
  };

  const activeConnections = connections.filter((c) => c.status !== "disconnected");

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            WhatsApp Connections
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Manage active WhatsApp sessions{isSuperAdmin ? " across all organizations" : ""}.
          </p>
        </div>
      </div>

      {activeConnections.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageCircleIcon size={40} />}
            title="No active sessions"
            description="No WhatsApp sessions are currently active."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {activeConnections.map((conn, i) => (
            <div
              key={conn.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-xs font-semibold text-accent select-none shrink-0">
                {(conn.username ?? conn.userId).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium truncate">
                  {conn.username ?? conn.userId}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {isSuperAdmin && (
                    <>
                      <span className="text-xs text-text-dim font-mono">
                        {conn.orgId}
                      </span>
                      <span className="text-text-dim">&middot;</span>
                    </>
                  )}
                  <span className="text-xs text-text-dim">
                    {conn.phone ?? "No phone"}
                  </span>
                  <span className="text-text-dim">&middot;</span>
                  <span className="text-xs text-text-dim">
                    {new Date(conn.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {statusBadge(conn.status)}
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRevokeTarget(conn)}
                loading={revoking === conn.userId}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        title="Revoke WhatsApp Session"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to disconnect WhatsApp for{" "}
            <span className="text-text-bright font-medium">
              {revokeTarget?.username ?? revokeTarget?.userId}
            </span>
            ? The session will be terminated within ~3 minutes.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRevoke}
              loading={revoking !== null}
            >
              Revoke Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
