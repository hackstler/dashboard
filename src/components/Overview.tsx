import { useApp } from "../context/AppContext";
import { usePolling } from "../hooks/usePolling";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { getWhatsappStatus } from "../api/channels";
import type { WhatsAppStatus } from "../api/channels";
import { listDocuments } from "../api/knowledge";
import type { DocumentSource } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/Card";
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

  const statusVariant =
    waStatus?.status === "connected"
      ? "success"
      : waStatus?.status === "qr"
        ? "warning"
        : "default";
  const statusLabel =
    waStatus?.status === "connected"
      ? "Connected"
      : waStatus?.status === "qr"
        ? "Awaiting QR"
        : "Disconnected";

  const totalDocs = docs?.length ?? 0;
  const indexedCount = docs?.filter((d) => d.status === "indexed").length ?? 0;
  const processingCount =
    docs?.filter((d) => d.status === "processing").length ?? 0;

  const animatedTotal = useAnimatedCounter(totalDocs);
  const animatedIndexed = useAnimatedCounter(indexedCount);

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-semibold gradient-text">Overview</h1>
        <p className="text-sm text-text-muted mt-1">
          Monitor your channels and knowledge base at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* WhatsApp Card */}
        <Card hover gradient className="animate-fade-in-up stagger-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[var(--radius-md)] bg-green-muted flex items-center justify-center">
                  <MessageCircleIcon size={14} className="text-green" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
              </div>
              {waLoading && !waStatus ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <Badge
                  variant={statusVariant}
                  dot
                  pulse={waStatus?.status === "connected"}
                >
                  {statusLabel}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {waLoading && !waStatus ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div>
                <p className="text-xs text-text-muted">
                  {waStatus?.status === "connected"
                    ? `Phone: ${waStatus.phone ?? "Unknown"}`
                    : waStatus?.status === "qr"
                      ? "Scan QR code to connect"
                      : "Start the worker to connect"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 -ml-2.5"
                  onClick={() => setActiveView("whatsapp")}
                >
                  Manage channel →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base Card */}
        <Card hover gradient className="animate-fade-in-up stagger-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[var(--radius-md)] bg-accent-dim flex items-center justify-center">
                  <DatabaseIcon size={14} className="text-accent" />
                </div>
                <CardTitle>Knowledge Base</CardTitle>
              </div>
              {docsLoading && !docs ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge variant="info">{animatedTotal} docs</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {docsLoading && !docs ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div>
                <p className="text-xs text-text-muted">
                  <span className="text-green font-medium">{animatedIndexed} indexed</span>
                  {processingCount > 0 && (
                    <span className="text-yellow"> · {processingCount} processing</span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 -ml-2.5"
                  onClick={() => setActiveView("knowledge-list")}
                >
                  View documents →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card hover gradient className="animate-fade-in-up stagger-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-purple-500/10 flex items-center justify-center">
                <BuildingIcon size={14} className="text-purple-400" />
              </div>
              <CardTitle>Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-dim mb-0.5">Org ID</p>
                <p className="text-sm text-text font-mono bg-surface-hi px-2 py-1 rounded-[var(--radius-sm)] inline-block">
                  {user?.orgId}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-dim mb-0.5">Role</p>
                <Badge variant={user?.role === "admin" ? "info" : "default"}>
                  {user?.role ?? "user"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
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
