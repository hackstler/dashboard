import { usePolling } from "../hooks/usePolling";
import {
  getWhatsappStatus,
  getWhatsappQr,
  disconnectWhatsapp,
} from "../api/channels";
import type { WhatsAppStatus } from "../api/channels";
import { useState } from "react";

export function WhatsAppPanel() {
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
      refetch();
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted font-mono text-sm tracking-wider animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h2 className="font-mono text-xs tracking-widest text-text-muted uppercase">
        WhatsApp
      </h2>

      {status?.status === "connected" && (
        <ConnectedState
          phone={status.phone}
          onDisconnect={handleDisconnect}
          disconnecting={disconnecting}
        />
      )}

      {status?.status === "qr" && <QrState />}

      {(!status || status.status === "disconnected") && <DisconnectedState />}
    </div>
  );
}

function ConnectedState({
  phone,
  onDisconnect,
  disconnecting,
}: {
  phone: string | null;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green" />
        <span className="text-text-bright text-sm">Connected</span>
      </div>
      {phone && <p className="font-mono text-sm text-text-muted">{phone}</p>}
      <button
        onClick={onDisconnect}
        disabled={disconnecting}
        className="px-4 py-2 text-xs font-mono tracking-wider text-red border border-border hover:border-border-hi transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {disconnecting ? "Disconnecting..." : "Disconnect"}
      </button>
    </div>
  );
}

function QrState() {
  const { data: qrData } = usePolling(() => getWhatsappQr(), 3000);

  if (!qrData) {
    return (
      <p className="text-text-muted font-mono text-sm animate-pulse">
        Waiting for QR code...
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded">
        <img
          src={
            qrData.startsWith("data:")
              ? qrData
              : `data:image/png;base64,${qrData}`
          }
          alt="WhatsApp QR Code"
          className="w-64 h-64"
        />
      </div>
      <p className="text-text-muted text-xs text-center max-w-xs">
        Scan this QR code with WhatsApp on your phone to connect.
      </p>
    </div>
  );
}

function DisconnectedState() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-text-dim" />
        <span className="text-text-muted text-sm">Disconnected</span>
      </div>
      <p className="text-text-dim text-xs text-center max-w-xs font-mono">
        The WhatsApp worker is not running. Start the worker to generate a QR
        code.
      </p>
    </div>
  );
}
