import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useChannels } from "../../hooks/useChannels";
import { completeOnboarding } from "../../api/auth";
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

interface OnboardingPageProps {
  onComplete: () => void;
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { authState, addToast } = useApp();
  const { status, qrData, pairingCode, loading, enable } = useChannels();
  const [enabling, setEnabling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const mobile = isMobile();

  const user = authState.status === "authenticated" ? authState.user : null;
  const firstName = user?.firstName ?? user?.name ?? "";

  useEffect(() => {
    if (!qrData) {
      setQrImage(null);
      return;
    }
    QRCode.toDataURL(qrData, { width: 256, margin: 2 })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [qrData]);

  const handleEnable = async (linkingMethod?: "qr" | "code", phone?: string) => {
    setEnabling(true);
    try {
      await enable(linkingMethod, phone);
    } catch {
      addToast("Error al activar WhatsApp", "error");
    } finally {
      setEnabling(false);
    }
  };

  const handleMobileEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/^\+/, "");
    if (!cleaned) return;
    await handleEnable("code", cleaned);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeOnboarding();
      onComplete();
    } catch {
      addToast("Error al completar onboarding", "error");
    } finally {
      setCompleting(false);
    }
  };

  const handleSkip = async () => {
    setCompleting(true);
    try {
      await completeOnboarding();
      onComplete();
    } catch {
      addToast("Error al completar onboarding", "error");
    } finally {
      setCompleting(false);
    }
  };

  const isConnected = status?.status === "connected";

  return (
    <div className="min-h-screen bg-bg noise-bg relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[150px] pointer-events-none animate-[glow-pulse_5s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-brand/6 rounded-full blur-[120px] pointer-events-none animate-[glow-pulse_7s_ease-in-out_infinite_1s]" />

      <div className="w-full max-w-md animate-fade-in-up relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-xl)] flex items-center justify-center mb-5 shadow-[var(--shadow-glow-accent)] animate-[float_4s_ease-in-out_infinite]">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            {firstName ? `Bienvenido, ${firstName}!` : "Bienvenido!"}
          </h1>
          <p className="text-xs text-text-muted mt-2 text-center">
            Configura WhatsApp para chatear con el asistente directamente desde tu teléfono
          </p>
        </div>

        <Card className="gradient-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[var(--radius-md)] bg-green-muted flex items-center justify-center">
                  <MessageCircleIcon size={14} className="text-green" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
              </div>
              {!loading || status ? (
                <Badge
                  variant={
                    isConnected
                      ? "success"
                      : status?.status === "qr" || status?.status === "code" || status?.status === "pending"
                        ? "warning"
                        : "default"
                  }
                  dot
                  pulse={isConnected}
                >
                  {isConnected
                    ? "Conectado"
                    : status?.status === "qr"
                      ? "Esperando escaneo"
                      : status?.status === "code"
                        ? "Esperando codigo"
                        : status?.status === "pending"
                          ? "Activando..."
                          : "No activado"}
                </Badge>
              ) : (
                <Skeleton className="h-5 w-24" />
              )}
            </div>
            <CardDescription>
              Conecta tu WhatsApp personal para hablar con el asistente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mobile ? (
              isConnected ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
                    <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
                      <MessageCircleIcon size={20} className="text-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-bright">WhatsApp Conectado</p>
                      {status?.phone && (
                        <p className="text-xs text-text-muted font-mono">{status.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : status?.status === "code" ? (
                <div className="flex flex-col items-center gap-4 animate-scale-in">
                  {pairingCode ? (
                    <div className="px-6 py-4 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card-hover)]">
                      <p className="text-3xl font-bold font-mono tracking-[0.3em] text-text-bright text-center">
                        {pairingCode}
                      </p>
                    </div>
                  ) : (
                    <Skeleton className="h-12 w-48 rounded-[var(--radius-md)]" />
                  )}
                  <div className="text-center">
                    <p className="text-sm text-text-muted">Introduce este codigo en WhatsApp</p>
                    <p className="text-xs text-text-dim mt-1">
                      Abre WhatsApp &rarr; Dispositivos vinculados &rarr; Vincular con numero de telefono
                    </p>
                  </div>
                </div>
              ) : status?.status === "pending" && status.linkingMethod === "code" ? (
                <div className="flex flex-col items-center py-8 animate-fade-in">
                  <Skeleton className="h-12 w-48 rounded-[var(--radius-md)]" />
                  <p className="text-xs text-text-muted mt-4 animate-pulse">
                    Generando codigo...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMobileEnable} className="space-y-4 animate-fade-in">
                  <EmptyState
                    icon={<MessageCircleIcon size={40} />}
                    title="WhatsApp no activado"
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
              )
            ) : loading && !status ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : isConnected ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
                  <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
                    <MessageCircleIcon size={20} className="text-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-bright">WhatsApp Conectado</p>
                    {status?.phone && (
                      <p className="text-xs text-text-muted font-mono">{status.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : status?.status === "qr" ? (
              <div className="flex flex-col items-center gap-4 animate-scale-in">
                {qrImage ? (
                  <div className="p-3 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card-hover)]">
                    <img src={qrImage} alt="WhatsApp QR Code" className="w-56 h-56" />
                  </div>
                ) : (
                  <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
                )}
                <div className="text-center">
                  <p className="text-sm text-text-muted">Escanea con WhatsApp</p>
                  <p className="text-xs text-text-dim mt-1">
                    Abre WhatsApp &rarr; Ajustes &rarr; Dispositivos vinculados &rarr; Vincular dispositivo
                  </p>
                </div>
              </div>
            ) : status?.status === "pending" ? (
              <div className="flex flex-col items-center py-8 animate-fade-in">
                <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
                <p className="text-xs text-text-muted mt-4 animate-pulse">
                  Esperando a que se inicialice tu sesión...
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <EmptyState
                  icon={<MessageCircleIcon size={40} />}
                  title="WhatsApp no activado"
                  description="Activa WhatsApp para conectar tu teléfono y chatear con el asistente directamente."
                />
                <Button variant="primary" onClick={handleEnable} loading={enabling}>
                  Activar WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3 mt-6">
          {isConnected ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
              loading={completing}
              className="px-8"
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSkip}
              loading={completing}
            >
              Saltar por ahora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
