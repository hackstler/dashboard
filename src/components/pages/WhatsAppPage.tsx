import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useChannels } from "../../hooks/useChannels";
import QRCode from "qrcode";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { MessageCircleIcon } from "../ui/Icons";

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}

export function WhatsAppPage() {
  const { addToast } = useApp();
  const { status, qrData, pairingCode, loading, enable, disconnect } =
    useChannels();
  const [disconnecting, setDisconnecting] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const mobile = isMobile();

  const handleEnable = async (
    linkingMethod?: "qr" | "code",
    phoneNumber?: string,
  ) => {
    setEnabling(true);
    try {
      await enable(linkingMethod, phoneNumber);
      addToast("WhatsApp session created", "success");
    } catch {
      addToast("Failed to enable WhatsApp", "error");
    } finally {
      setEnabling(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnect();
      addToast("WhatsApp disconnected", "success");
    } catch {
      addToast("Failed to disconnect", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          WhatsApp
        </h1>
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
                    : status?.status === "qr" ||
                        status?.status === "code" ||
                        status?.status === "pending"
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
                    : status?.status === "code"
                      ? "Awaiting code"
                      : status?.status === "pending"
                        ? "Enabling..."
                        : status?.status === "not_enabled"
                          ? "Not enabled"
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
          ) : mobile ? (
            status?.status === "code" ? (
              <PairingCodeContent pairingCode={pairingCode} />
            ) : status?.status === "pending" &&
              status.linkingMethod === "code" ? (
              <div className="flex flex-col items-center py-8 animate-fade-in">
                <Skeleton className="h-12 w-48 rounded-[var(--radius-md)]" />
                <p className="text-xs text-text-muted mt-4 animate-pulse">
                  Generando codigo...
                </p>
              </div>
            ) : (
              <MobileNotEnabledContent
                onEnable={handleEnable}
                enabling={enabling}
              />
            )
          ) : status?.status === "qr" ? (
            <QrContent qrData={qrData} />
          ) : status?.status === "pending" ? (
            <PendingContent />
          ) : (
            <NotEnabledContent
              onEnable={handleEnable}
              enabling={enabling}
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

function QrContent({ qrData }: { qrData: string | null }) {
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
          Open WhatsApp &rarr; Settings &rarr; Linked Devices &rarr; Link a
          Device
        </p>
      </div>
    </div>
  );
}

function MobileNotEnabledContent({
  onEnable,
  enabling,
}: {
  onEnable: (linkingMethod: "code", phoneNumber: string) => void;
  enabling: boolean;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/^\+/, "");
    if (!cleaned) return;
    onEnable("code", cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <EmptyState
        icon={<MessageCircleIcon size={40} />}
        title="WhatsApp not enabled"
        description="Introduce tu numero de telefono para vincular WhatsApp con un codigo."
      />
      <Input
        label="Numero de telefono"
        type="tel"
        placeholder="+34612345678"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <Button
        type="submit"
        variant="primary"
        loading={enabling}
        disabled={!phoneNumber.replace(/^\+/, "")}
      >
        Vincular WhatsApp
      </Button>
    </form>
  );
}

function PairingCodeContent({
  pairingCode,
}: {
  pairingCode: string | null;
}) {
  if (!pairingCode) {
    return (
      <div className="flex flex-col items-center py-8 animate-fade-in">
        <Skeleton className="h-12 w-48 rounded-[var(--radius-md)]" />
        <p className="text-xs text-text-muted mt-4 animate-pulse">
          Generando codigo...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <div className="px-6 py-4 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card-hover)]">
        <p className="text-3xl font-bold font-mono tracking-[0.3em] text-text-bright text-center">
          {pairingCode}
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-text-muted">
          Introduce este codigo en WhatsApp
        </p>
        <p className="text-xs text-text-dim mt-1">
          Abre WhatsApp &rarr; Dispositivos vinculados &rarr; Vincular con
          numero de telefono &rarr; Introduce este codigo
        </p>
      </div>
    </div>
  );
}

function NotEnabledContent({
  onEnable,
  enabling,
}: {
  onEnable: () => void;
  enabling: boolean;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <EmptyState
        icon={<MessageCircleIcon size={40} />}
        title="WhatsApp not enabled"
        description="Enable WhatsApp to connect your personal phone and chat with the AI agent directly from WhatsApp."
      />
      <Button variant="primary" onClick={onEnable} loading={enabling}>
        Enable WhatsApp
      </Button>
    </div>
  );
}

function PendingContent() {
  return (
    <div className="flex flex-col items-center py-8 animate-fade-in">
      <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
      <p className="text-xs text-text-muted mt-4 animate-pulse">
        Waiting for worker to initialize your session...
      </p>
    </div>
  );
}
