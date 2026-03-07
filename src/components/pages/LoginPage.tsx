import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { getAuthStrategy, loginWithFirebaseToken } from "../../api/auth";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface LoginPageProps {
  onLogin: () => void;
}

function PasswordLoginPanel({ onLogin }: LoginPageProps) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      onLogin();
    } catch {
      // error is set by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {auth.error && (
        <div className="px-3 py-2 bg-red-muted border border-red/20 rounded-[var(--radius-md)] animate-fade-in">
          <p className="text-xs text-red">{auth.error}</p>
        </div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
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
        loading={auth.loading}
        disabled={!email || !password}
        className="w-full mt-2"
      >
        Sign in
      </Button>
    </form>
  );
}

function FirebaseLoginPanel({ onLogin }: LoginPageProps) {
  const firebase = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for magic link completion on mount
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const idToken = await firebase.completeMagicLink();
        if (idToken && !controller.signal.aborted) {
          await loginWithFirebaseToken(idToken);
          onLogin();
        }
      } catch {
        // not a magic link URL or failed — ignore
      }
    })();
    return () => controller.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const idToken = await firebase.signInWithGoogle();
      await loginWithFirebaseToken(idToken);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await firebase.sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {(error ?? firebase.error) && (
        <div className="px-3 py-2 bg-red-muted border border-red/20 rounded-[var(--radius-md)] animate-fade-in">
          <p className="text-xs text-red">{error ?? firebase.error}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={handleGoogleSignIn}
        loading={loading && !magicLinkSent}
        className="w-full"
      >
        Sign in with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-dim">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {magicLinkSent ? (
        <div className="px-3 py-3 bg-accent/10 border border-accent/20 rounded-[var(--radius-md)] animate-fade-in">
          <p className="text-sm text-text-bright text-center">
            Check your email for the sign-in link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSendMagicLink} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            loading={loading && !magicLinkSent}
            disabled={!email}
            className="w-full"
          >
            Send magic link
          </Button>
        </form>
      )}
    </div>
  );
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const strategy = getAuthStrategy();

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4 noise-bg relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[150px] pointer-events-none animate-[glow-pulse_5s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-brand/6 rounded-full blur-[120px] pointer-events-none animate-[glow-pulse_7s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-accent/4 rounded-full blur-[100px] pointer-events-none animate-[glow-pulse_6s_ease-in-out_infinite_2s]" />

      <div className="w-full max-w-sm animate-fade-in-up relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-xl)] flex items-center justify-center mb-5 shadow-[var(--shadow-glow-accent)] animate-[float_4s_ease-in-out_infinite]">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            Sign in to your account
          </h1>
          <p className="text-xs text-text-muted mt-2">
            {strategy === "firebase"
              ? "Sign in with your Google account or email"
              : "Enter your credentials to continue"}
          </p>
        </div>

        <Card className="gradient-border">
          <CardContent>
            {strategy === "firebase" ? (
              <FirebaseLoginPanel onLogin={onLogin} />
            ) : (
              <PasswordLoginPanel onLogin={onLogin} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
