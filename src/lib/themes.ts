/**
 * AI Native Club - Theme Configuration
 *
 * Easy to swap between color schemes.
 * Change the active theme and rebuild to try different looks.
 */

export type ThemeColor = "amber" | "cyan" | "purple";

export const themes = {
  amber: {
    name: "Warm Amber",
    description: "Inviting, premium, human",
    hue: 55,
    // oklch values for the brand color
    light: "oklch(0.75 0.18 55)",
    dark: "oklch(0.78 0.16 55)",
  },
  cyan: {
    name: "Cool Cyan",
    description: "Fresh, modern, tech-forward",
    hue: 190,
    light: "oklch(0.70 0.15 190)",
    dark: "oklch(0.75 0.12 190)",
  },
  purple: {
    name: "Soft Purple",
    description: "Creative, different, playful",
    hue: 280,
    light: "oklch(0.65 0.15 280)",
    dark: "oklch(0.70 0.12 280)",
  },
} as const;

// Current active theme - change this to try different colors
export const activeTheme: ThemeColor = "amber";

// Helper to get theme config
export function getTheme(color: ThemeColor = activeTheme) {
  return themes[color];
}
