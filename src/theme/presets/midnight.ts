import type { ThemeTokens } from "../tokens";

export const midnight: ThemeTokens = {
  // Surfaces
  bg: "#09090b",
  surface: "#0f0f12",
  surfaceHi: "#17171c",
  surfaceHover: "#1c1c22",
  surfaceRaised: "#222228",
  border: "#1c1c24",
  borderHi: "#2a2a35",

  // Text
  text: "#a1a1aa",
  textBright: "#fafafa",
  textMuted: "#63636e",
  textDim: "#33333d",

  // Brand
  accent: "#3b82f6",
  accentHover: "#2563eb",
  accentMuted: "#1d4ed8",
  accentDim: "rgba(59, 130, 246, 0.08)",
  brand: "#8b5cf6",
  brandDim: "rgba(139, 92, 246, 0.08)",
  brandAccent: "#ec4899",

  // Status
  green: "#22c55e",
  greenMuted: "rgba(34, 197, 94, 0.08)",
  yellow: "#eab308",
  yellowMuted: "rgba(234, 179, 8, 0.08)",
  red: "#ef4444",
  redMuted: "rgba(239, 68, 68, 0.08)",

  // Glass
  glass: "rgba(15, 15, 18, 0.80)",
  glassSubtle: "rgba(15, 15, 18, 0.60)",

  // Shimmer
  shimmer: "rgba(255, 255, 255, 0.03)",

  // Shadows
  shadowCard: "0 0 0 1px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.4)",
  shadowCardHover: "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5), 0 0 48px var(--card-glow, rgba(59,130,246,0.06))",
  shadowGlowAccent: "0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)",
  shadowGlowGreen: "0 0 30px rgba(34,197,94,0.25), 0 0 60px rgba(34,197,94,0.08)",
  shadowToastSuccess: "0 0 24px rgba(34, 197, 94, 0.15), 0 0 48px rgba(34, 197, 94, 0.05)",
  shadowToastError: "0 0 24px rgba(239, 68, 68, 0.15), 0 0 48px rgba(239, 68, 68, 0.05)",
  shadowToastInfo: "0 0 24px rgba(59, 130, 246, 0.15), 0 0 48px rgba(59, 130, 246, 0.05)",
  shadowNavActive: "inset 0 0 0 1px rgba(59, 130, 246, 0.2), 0 0 16px rgba(59, 130, 246, 0.08)",

  // Radii
  radiusSm: "0.375rem",
  radiusMd: "0.5rem",
  radiusLg: "0.75rem",
  radiusXl: "1rem",

  // Fonts
  fontMono: "'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};
