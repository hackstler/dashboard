import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useGoogleConnection } from "../../hooks/useGoogleConnection";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { SettingsIcon } from "../ui/Icons";

export function SettingsPage() {
  const { addToast } = useApp();
  const { status, loading, connect, disconnect, refetch } = useGoogleConnection();
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Handle OAuth callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleConnected") === "true") {
      addToast("Google account connected successfully", "success");
      refetch();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("googleError")) {
      addToast(`Google connection failed: ${params.get("googleError")}`, "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      addToast("Failed to start Google connection", "error");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnect();
      addToast("Google account disconnected", "success");
    } catch {
      addToast("Failed to disconnect Google account", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Manage your account integrations and preferences.
        </p>
      </div>

      <Card className="max-w-lg gradient-border animate-fade-in-up stagger-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-accent-dim flex items-center justify-center">
                <GoogleIcon size={14} />
              </div>
              <CardTitle>Google Account</CardTitle>
            </div>
            {loading && !status ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge
                variant={status?.connected ? "success" : "default"}
                dot
                pulse={status?.connected}
              >
                {status?.connected ? "Connected" : "Not connected"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Connect your Google account to use Gmail and Calendar features
            through the agent.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading && !status ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32 mt-2" />
            </div>
          ) : status?.connected ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
                <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
                  <GoogleIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-bright">
                    Google Account Connected
                  </p>
                  <p className="text-xs text-text-muted">
                    Gmail and Calendar access enabled
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDisconnect}
                loading={disconnecting}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <EmptyState
                icon={<SettingsIcon size={40} />}
                title="Google not connected"
                description="Connect your Google account to enable Gmail and Calendar features. The agent will be able to read your emails and manage your calendar."
              />
              <Button
                variant="primary"
                onClick={handleConnect}
                loading={connecting}
              >
                Connect Google Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}
