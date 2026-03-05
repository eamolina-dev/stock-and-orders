import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeContextValue } from "./theme-context";
import { defaultThemeName, themeRegistry, type Theme, type ThemeName } from "./themes";

const THEME_STORAGE_KEY = "app-theme";

const applyThemeVariables = (theme: Theme, themeName: ThemeName) => {
  const root = document.documentElement;

  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-bg", theme.colors.background);
  root.style.setProperty("--color-surface", theme.colors.surface);
  root.style.setProperty("--color-card", theme.colors.card);
  root.style.setProperty("--color-border", theme.colors.border);
  root.style.setProperty("--color-text", theme.colors.text);
  root.style.setProperty("--color-text-muted", theme.colors.textMuted);
  root.style.setProperty("--font-family", theme.typography.fontFamily);

  root.setAttribute("data-theme", themeName);
};

const getInitialTheme = (): ThemeName => {
  if (typeof window === "undefined") return defaultThemeName;

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
  if (saved && saved in themeRegistry) {
    return saved;
  }

  return defaultThemeName;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    const selectedTheme = themeRegistry[themeName] ?? themeRegistry[defaultThemeName];
    applyThemeVariables(selectedTheme, themeName);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [themeName]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme: themeRegistry[themeName],
      setTheme: setThemeName,
      availableThemes: Object.keys(themeRegistry) as ThemeName[],
    }),
    [themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
