export interface ThemeTokens {
  // Surfaces
  bg: string;
  surface: string;
  surfaceHi: string;
  surfaceHover: string;
  surfaceRaised: string;
  border: string;
  borderHi: string;

  // Text
  text: string;
  textBright: string;
  textMuted: string;
  textDim: string;

  // Brand
  accent: string;
  accentHover: string;
  accentMuted: string;
  accentDim: string;
  brand: string;
  brandDim: string;
  brandAccent: string;

  // Status
  green: string;
  greenMuted: string;
  yellow: string;
  yellowMuted: string;
  red: string;
  redMuted: string;

  // Glass
  glass: string;
  glassSubtle: string;

  // Shimmer
  shimmer: string;

  // Shadows
  shadowCard: string;
  shadowCardHover: string;
  shadowGlowAccent: string;
  shadowGlowGreen: string;
  shadowToastSuccess: string;
  shadowToastError: string;
  shadowToastInfo: string;
  shadowNavActive: string;

  // Radii
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;

  // Fonts
  fontMono: string;
  fontSans: string;
}

/** Maps a ThemeTokens key to its CSS custom property name */
export const TOKEN_TO_CSS: Record<keyof ThemeTokens, string> = {
  bg: "--color-bg",
  surface: "--color-surface",
  surfaceHi: "--color-surface-hi",
  surfaceHover: "--color-surface-hover",
  surfaceRaised: "--color-surface-raised",
  border: "--color-border",
  borderHi: "--color-border-hi",

  text: "--color-text",
  textBright: "--color-text-bright",
  textMuted: "--color-text-muted",
  textDim: "--color-text-dim",

  accent: "--color-accent",
  accentHover: "--color-accent-hover",
  accentMuted: "--color-accent-muted",
  accentDim: "--color-accent-dim",
  brand: "--color-brand",
  brandDim: "--color-brand-dim",
  brandAccent: "--color-brand-accent",

  green: "--color-green",
  greenMuted: "--color-green-muted",
  yellow: "--color-yellow",
  yellowMuted: "--color-yellow-muted",
  red: "--color-red",
  redMuted: "--color-red-muted",

  glass: "--color-glass",
  glassSubtle: "--color-glass-subtle",

  shimmer: "--color-shimmer",

  shadowCard: "--shadow-card",
  shadowCardHover: "--shadow-card-hover",
  shadowGlowAccent: "--shadow-glow-accent",
  shadowGlowGreen: "--shadow-glow-green",
  shadowToastSuccess: "--shadow-toast-success",
  shadowToastError: "--shadow-toast-error",
  shadowToastInfo: "--shadow-toast-info",
  shadowNavActive: "--shadow-nav-active",

  radiusSm: "--radius-sm",
  radiusMd: "--radius-md",
  radiusLg: "--radius-lg",
  radiusXl: "--radius-xl",

  fontMono: "--font-mono",
  fontSans: "--font-sans",
};
