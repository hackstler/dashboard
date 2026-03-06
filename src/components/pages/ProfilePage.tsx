import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { updateProfile, getAuthStrategy } from "../../api/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { SaveIcon } from "../ui/Icons";

export function ProfilePage() {
  const { user, addToast } = useApp();
  const strategy = getAuthStrategy();
  const [email, setEmail] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const data: { email?: string; password?: string } = {};

    if (email !== user?.username) {
      data.email = email;
    }
    if (password) {
      if (password !== confirmPassword) {
        addToast("Passwords do not match", "error");
        return;
      }
      if (password.length < 8) {
        addToast("Password must be at least 8 characters", "error");
        return;
      }
      data.password = password;
    }

    if (!data.email && !data.password) {
      addToast("No changes to save", "info");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(data);
      addToast("Profile updated", "success");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            Profile
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Manage your account settings.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Info (read-only) */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            Account Info
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-base font-semibold text-accent select-none shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              {user?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-bright font-medium truncate">
                {user?.username}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-dim font-mono">
                  {user?.orgId}
                </span>
                <Badge
                  variant={
                    user?.role === "super_admin" || user?.role === "admin"
                      ? "info"
                      : "default"
                  }
                >
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Email */}
        {strategy === "password" && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
            <h2 className="text-sm font-semibold text-text-bright mb-4">
              Email
            </h2>
            <div className="max-w-md">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Change Password */}
        {strategy === "password" && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-2">
            <h2 className="text-sm font-semibold text-text-bright mb-4">
              Change Password
            </h2>
            <div className="space-y-4 max-w-md">
              <Input
                label="New password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Save */}
        {strategy === "password" && (
          <div className="flex justify-end pt-2 pb-4">
            <Button
              variant="primary"
              size="sm"
              icon={<SaveIcon size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        )}

        {strategy === "firebase" && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
            <p className="text-sm text-text-muted">
              Your account is managed through Firebase. Use your Google account
              settings to update your email or password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
