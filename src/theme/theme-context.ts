import { createContext } from "react";
import type { Theme, ThemeName } from "./themes";

export type ThemeContextValue = {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  availableThemes: ThemeName[];
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
