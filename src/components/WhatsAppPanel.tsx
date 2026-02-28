import { usePolling } from "../hooks/usePolling";
import {
  getWhatsappStatus,
  getWhatsappQr,
  disconnectWhatsapp,
} from "../api/channels";
import type { WhatsAppStatus } from "../api/channels";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import { MessageCircleIcon } from "./ui/Icons";

export function WhatsAppPanel() {
  const { addToast } = useApp();
  const {
    data: status,
    loading,
    refetch,
  } = usePolling<WhatsAppStatus>(getWhatsappStatus, 3000);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectWhatsapp();
      addToast("WhatsApp disconnected", "success");
      refetch();
    } catch {
      addToast("Failed to disconnect", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">WhatsApp</h1>
        <p className="text-sm text-text-muted mt-2">
          Manage your WhatsApp channel connection.
        </p>
      </div>

      <Card className="max-w-lg gradient-border animate-fade-in-up stagger-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-green-muted flex items-center justify-center">
                <MessageCircleIcon size={14} className="text-green" />
              </div>
              <CardTitle>Channel Status</CardTitle>
            </div>
            {loading && !status ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge
                variant={
                  status?.status === "connected"
                    ? "success"
                    : status?.status === "qr"
                      ? "warning"
                      : "default"
                }
                dot
                pulse={status?.status === "connected"}
              >
                {status?.status === "connected"
                  ? "Connected"
                  : status?.status === "qr"
                    ? "Awaiting scan"
                    : "Disconnected"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Connect WhatsApp to receive and send messages through the agent.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading && !status ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32 mt-2" />
            </div>
          ) : status?.status === "connected" ? (
            <ConnectedContent
              phone={status.phone}
              onDisconnect={handleDisconnect}
              disconnecting={disconnecting}
            />
          ) : status?.status === "qr" ? (
            <QrContent />
          ) : (
            <EmptyState
              icon={<MessageCircleIcon size={40} />}
              title="Not connected"
              description="The WhatsApp worker is not running. Start the worker to generate a QR code for connection."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectedContent({
  phone,
  onDisconnect,
  disconnecting,
}: {
  phone: string | null;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
        <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
          <MessageCircleIcon size={20} className="text-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-bright">
            WhatsApp Connected
          </p>
          {phone && (
            <p className="text-xs text-text-muted font-mono">{phone}</p>
          )}
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        onClick={onDisconnect}
        loading={disconnecting}
      >
        Disconnect
      </Button>
    </div>
  );
}

function QrContent() {
  const { data: qrData } = usePolling(() => getWhatsappQr(), 3000);
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    if (!qrData) return;
    QRCode.toDataURL(qrData, { width: 256, margin: 2 })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [qrData]);

  if (!qrData || !qrImage) {
    return (
      <div className="flex flex-col items-center py-8">
        <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
        <p className="text-xs text-text-muted mt-4 animate-pulse">
          Generating QR code...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <div className="p-3 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card-hover)]">
        <img src={qrImage} alt="WhatsApp QR Code" className="w-56 h-56" />
      </div>
      <div className="text-center">
        <p className="text-sm text-text-muted">Scan with WhatsApp</p>
        <p className="text-xs text-text-dim mt-1">
          Open WhatsApp → Settings → Linked Devices → Link a Device
        </p>
      </div>
    </div>
  );
}
