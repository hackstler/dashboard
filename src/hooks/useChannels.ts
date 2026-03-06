import { useCallback } from "react";
import { usePolling } from "./usePolling";
import {
  getWhatsappStatus,
  getWhatsappQr,
  enableWhatsapp,
  disconnectWhatsapp,
} from "../api/channels";
import type { WhatsAppStatus } from "../types";

interface UseChannelsReturn {
  status: WhatsAppStatus | null;
  qrData: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  enable: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useChannels(pollingInterval = 3000): UseChannelsReturn {
  const {
    data: status,
    loading,
    error,
    refetch,
  } = usePolling<WhatsAppStatus>(getWhatsappStatus, pollingInterval);

  const isQrPhase = status?.status === "qr";
  const { data: qrData } = usePolling<string | null>(
    getWhatsappQr,
    pollingInterval,
    isQrPhase
  );

  const enable = useCallback(async () => {
    await enableWhatsapp();
    refetch();
  }, [refetch]);

  const disconnect = useCallback(async () => {
    await disconnectWhatsapp();
    refetch();
  }, [refetch]);

  return {
    status,
    qrData,
    loading,
    error,
    refetch,
    enable,
    disconnect,
  };
}
