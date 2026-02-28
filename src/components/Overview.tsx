import { useApp } from "../context/AppContext";
import { usePolling } from "../hooks/usePolling";
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

  const indexedCount = docs?.filter((d) => d.status === "indexed").length ?? 0;
  const processingCount =
    docs?.filter((d) => d.status === "processing").length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-bright">Overview</h1>
        <p className="text-sm text-text-muted mt-1">
          Monitor your channels and knowledge base at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircleIcon size={16} className="text-text-muted" />
                <CardTitle>WhatsApp</CardTitle>
              </div>
              {waLoading && !waStatus ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <Badge variant={statusVariant} dot>
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

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DatabaseIcon size={16} className="text-text-muted" />
                <CardTitle>Knowledge Base</CardTitle>
              </div>
              {docsLoading && !docs ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge variant="info">{docs?.length ?? 0} documents</Badge>
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
                  {indexedCount} indexed
                  {processingCount > 0 && `, ${processingCount} processing`}
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

        <Card hover>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BuildingIcon size={16} className="text-text-muted" />
              <CardTitle>Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-text-dim">Org ID</p>
                <p className="text-sm text-text font-mono">{user?.orgId}</p>
              </div>
              <div>
                <p className="text-xs text-text-dim">Role</p>
                <Badge variant={user?.role === "admin" ? "info" : "default"}>
                  {user?.role ?? "user"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-bright mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
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
