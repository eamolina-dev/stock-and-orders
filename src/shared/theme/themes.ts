export const themes = {
  light: "theme-light",
  dark: "theme-dark",
  green: "theme-green",
  sky: "theme-sky",
  bold: "theme-bold",
} as const;

export type ThemeKey = keyof typeof themes;