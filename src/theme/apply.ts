import type { ThemeTokens } from "./tokens";
import { TOKEN_TO_CSS } from "./tokens";

/**
 * Applies a theme preset by setting CSS custom properties on :root.
 * Call this to override the default @theme values at runtime.
 */
export function applyTheme(tokens: ThemeTokens): void {
  const root = document.documentElement.style;
  for (const key of Object.keys(tokens) as (keyof ThemeTokens)[]) {
    const cssVar = TOKEN_TO_CSS[key];
    root.setProperty(cssVar, tokens[key]);
  }
}
