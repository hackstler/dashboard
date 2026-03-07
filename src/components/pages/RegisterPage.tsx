import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useAuthAdapter } from "../../hooks/useAuthAdapter";
import { validateInviteToken } from "../../api/auth";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import type { InviteValidation } from "../../types";

export function RegisterPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const adapter = useAuthAdapter();

  const [state, setState] = useState<"loading" | "invalid" | "form">("loading");
  const [validation, setValidation] = useState<InviteValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage("Link invalido. No se encontro token de invitacion.");
      setState("invalid");
      return;
    }

    validateInviteToken(token)
      .then((result) => {
        if (result.valid) {
          setValidation(result);
          if (result.email) setEmail(result.email);
          setState("form");
        } else {
          if (result.reason === "expired") {
            setErrorMessage("Esta invitacion ha expirado. Contacta a tu administrador.");
          } else if (result.reason === "used") {
            setErrorMessage("Esta invitacion ya fue utilizada.");
          } else {
            setErrorMessage("Invitacion invalida.");
          }
          setState("invalid");
        }
      })
      .catch(() => {
        setErrorMessage("Invitacion invalida o expirada.");
        setState("invalid");
      });
  }, [token]);

  // Handle redirect result on mount (mobile comes back here after Google redirect)
  useEffect(() => {
    if (state !== "form" || !token) return;
    let cancelled = false;
    adapter.handleRedirectResult().then((completed) => {
      if (completed && !cancelled) navigate("/", { replace: true });
    }).catch((err) => {
      if (!cancelled) setFormError(err instanceof Error ? err.message : "Error al registrar");
    });
    return () => { cancelled = true; };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCredentialRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError("Las contrasenas no coinciden");
      return;
    }
    if (password.length < 8) {
      setFormError("La contrasena debe tener al menos 8 caracteres");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await adapter.registerWithCredentials(
        token!,
        email,
        password,
        firstName || undefined,
        lastName || undefined,
      );
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      await adapter.registerWithGoogle(
        token!,
        firstName || undefined,
        lastName || undefined,
      );
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar con Google");
    } finally {
      setSubmitting(false);
    }
  };

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

          {state === "loading" && (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </>
          )}

          {state === "invalid" && (
            <>
              <h1 className="text-2xl font-bold gradient-text">
                Invitacion no valida
              </h1>
              <p className="text-xs text-text-muted mt-2 text-center">
                {errorMessage}
              </p>
            </>
          )}

          {state === "form" && (
            <>
              <h1 className="text-2xl font-bold gradient-text">
                Crear tu cuenta
              </h1>
              <p className="text-xs text-text-muted mt-2 text-center">
                Estas invitado a unirte{validation?.orgName ? ` a ${validation.orgName}` : ""}
              </p>
            </>
          )}
        </div>

        {state === "loading" && (
          <Card className="gradient-border">
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {state === "invalid" && (
          <Card className="gradient-border">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-text-muted mb-4">{errorMessage}</p>
                <Button variant="primary" onClick={() => navigate("/", { replace: true })}>
                  Ir a iniciar sesion
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {state === "form" && (
          <Card className="gradient-border">
            <CardContent>
              <div className="flex flex-col gap-4">
                {formError && (
                  <div className="px-3 py-2 bg-red-muted border border-red/20 rounded-[var(--radius-md)] animate-fade-in">
                    <p className="text-xs text-red">{formError}</p>
                  </div>
                )}

                {validation?.orgName && (
                  <Input
                    label="Organizacion"
                    value={validation.orgName}
                    disabled
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                  <Input
                    label="Apellido"
                    placeholder="Tu apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>

                {adapter.strategyName === "firebase" && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleGoogleRegister}
                      loading={submitting}
                      className="w-full"
                    >
                      Registrarse con Google
                    </Button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-text-dim">o</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </>
                )}

                <form onSubmit={handleCredentialRegister} className="flex flex-col gap-3">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={!!validation?.email}
                  />
                  <Input
                    label="Contrasena"
                    type="password"
                    placeholder="Minimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirmar contrasena"
                    type="password"
                    placeholder="Repite la contrasena"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <Button
                    type="submit"
                    variant={adapter.strategyName === "firebase" ? "secondary" : "primary"}
                    size="lg"
                    loading={submitting}
                    disabled={!email || !password || !confirmPassword}
                    className="w-full"
                  >
                    {adapter.strategyName === "firebase" ? "Crear cuenta con email" : "Crear cuenta"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
