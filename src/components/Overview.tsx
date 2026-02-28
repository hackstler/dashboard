import { useApp } from "../context/AppContext";
import { usePolling } from "../hooks/usePolling";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { getWhatsappStatus } from "../api/channels";
import type { WhatsAppStatus } from "../api/channels";
import { listDocuments } from "../api/knowledge";
import type { DocumentSource } from "../types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import {
  MessageCircleIcon,
  DatabaseIcon,
  BuildingIcon,
  UploadIcon,
} from "./ui/Icons";

export function Overview() {
  const { user, setActiveView } = useApp();
  const { data: waStatus, loading: waLoading } =
    usePolling<WhatsAppStatus>(getWhatsappStatus, 5000);
  const { data: docs, loading: docsLoading } = usePolling<DocumentSource[]>(
    () => listDocuments(),
    10000
  );

  const totalDocs = docs?.length ?? 0;
  const indexedCount = docs?.filter((d) => d.status === "indexed").length ?? 0;
  const processingCount =
    docs?.filter((d) => d.status === "processing").length ?? 0;

  const animatedTotal = useAnimatedCounter(totalDocs);
  const animatedIndexed = useAnimatedCounter(indexedCount);

  const waConnected = waStatus?.status === "connected";
  const waQr = waStatus?.status === "qr";

  return (
    <div className="relative">
      {/* Ambient glow orbs */}
      <div className="ambient-orb w-[600px] h-[400px] bg-accent/[0.07] -top-32 -left-48" />
      <div className="ambient-orb w-[500px] h-[350px] bg-brand/[0.05] top-20 -right-40" />
      <div className="ambient-orb w-[300px] h-[200px] bg-brand-accent/[0.03] bottom-0 left-1/3" />

      {/* Header */}
      <div className="mb-10 animate-fade-in-up relative">
        <h1 className="text-3xl font-bold gradient-text tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Monitor your channels and knowledge base at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* WhatsApp */}
        <div
          className="stat-card glow-card gradient-border bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-1"
          style={{
            "--stat-accent": waConnected ? "#22c55e" : waQr ? "#eab308" : "#3b82f6",
            "--stat-glow": waConnected
              ? "rgba(34,197,94,0.15)"
              : waQr
                ? "rgba(234,179,8,0.10)"
                : "rgba(59,130,246,0.10)",
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-green-muted flex items-center justify-center">
              <MessageCircleIcon size={20} className="text-green" />
            </div>
            {waLoading && !waStatus ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge
                variant={waConnected ? "success" : waQr ? "warning" : "default"}
                dot
                pulse={waConnected}
              >
                {waConnected ? "Connected" : waQr ? "Awaiting QR" : "Disconnected"}
              </Badge>
            )}
          </div>
          <div className="mb-2">
            <p className="text-3xl font-bold text-text-bright tracking-tight">
              {waLoading && !waStatus ? (
                <Skeleton className="h-9 w-24 inline-block" />
              ) : waConnected ? (
                waStatus?.phone ?? "Active"
              ) : (
                "Offline"
              )}
            </p>
          </div>
          <p className="text-xs text-text-muted mb-4">WhatsApp Channel</p>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5"
            onClick={() => setActiveView("whatsapp")}
          >
            Manage channel →
          </Button>
        </div>

        {/* Knowledge Base */}
        <div
          className="stat-card glow-card gradient-border bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-2"
          style={{
            "--stat-accent": "#3b82f6",
            "--stat-glow": "rgba(59,130,246,0.12)",
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-accent-dim flex items-center justify-center">
              <DatabaseIcon size={20} className="text-accent" />
            </div>
            {docsLoading && !docs ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Badge variant="info">{animatedIndexed} indexed</Badge>
            )}
          </div>
          <div className="mb-1">
            {docsLoading && !docs ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-4xl font-bold text-text-bright tracking-tight tabular-nums">
                {animatedTotal}
              </p>
            )}
          </div>
          <p className="text-xs text-text-muted mb-4">
            Documents
            {processingCount > 0 && (
              <span className="text-yellow ml-1">
                · {processingCount} processing
              </span>
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5"
            onClick={() => setActiveView("knowledge-list")}
          >
            View documents →
          </Button>
        </div>

        {/* Organization */}
        <div
          className="stat-card glow-card gradient-border bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-3"
          style={{
            "--stat-accent": "#8b5cf6",
            "--stat-glow": "rgba(139,92,246,0.12)",
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-brand/10 flex items-center justify-center">
              <BuildingIcon size={20} className="text-brand" />
            </div>
            <Badge variant={user?.role === "admin" ? "info" : "default"}>
              {user?.role ?? "user"}
            </Badge>
          </div>
          <div className="mb-2">
            <p className="text-3xl font-bold text-text-bright tracking-tight font-mono">
              {user?.orgId}
            </p>
          </div>
          <p className="text-xs text-text-muted mb-4">Organization</p>
          <p className="text-xs text-text-dim">
            {user?.role === "admin"
              ? "Full access to all resources"
              : "Member access"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up stagger-4">
        <h2 className="text-sm font-semibold text-text-bright mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            icon={<UploadIcon size={16} />}
            onClick={() => setActiveView("knowledge-upload")}
          >
            Upload content
          </Button>
          <Button
            variant="secondary"
            icon={<MessageCircleIcon size={16} />}
            onClick={() => setActiveView("whatsapp")}
          >
            WhatsApp settings
          </Button>
        </div>
      </div>
    </div>
  );
}
