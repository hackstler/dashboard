import { useState } from "react";
import { login } from "../api/auth";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
        <h1 className="font-mono text-xs tracking-widest text-text-muted uppercase text-center">
          Agent Dashboard
        </h1>
        {error && <p className="text-red text-xs text-center">{error}</p>}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface border border-border text-text text-sm px-3 py-2 outline-none focus:border-border-hi transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface border border-border text-text text-sm px-3 py-2 outline-none focus:border-border-hi transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="bg-surface border border-border text-text-muted text-xs font-mono tracking-wider py-2 hover:text-text-bright hover:border-border-hi transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Login"}
        </button>
      </form>
    </div>
  );
}
