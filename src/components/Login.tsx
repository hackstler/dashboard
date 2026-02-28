import { useState } from "react";
import { login } from "../api/auth";
import { Card, CardContent } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-accent rounded-[var(--radius-lg)] flex items-center justify-center mb-4">
            <span className="text-white text-lg font-bold">A</span>
          </div>
          <h1 className="text-lg font-semibold text-text-bright">
            Sign in to your account
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Enter your credentials to continue
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="px-3 py-2 bg-red-muted border border-red/20 rounded-[var(--radius-md)]">
                  <p className="text-xs text-red">{error}</p>
                </div>
              )}
              <Input
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!username || !password}
                className="w-full mt-2"
              >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
