export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
  };
  typography: {
    fontFamily: string;
  };
}

export const themeRegistry: Record<string, Theme> = {
  dark: {
    name: "Dark",
    colors: {
      primary: "#f2f1ee",
      secondary: "#c2a878",
      background: "#1c1c1a",
      surface: "#242421",
      card: "#2a2a27",
      border: "#3a3a36",
      text: "#f2f1ee",
      textMuted: "#b5b1ab",
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  light: {
    name: "Light",
    colors: {
      primary: "#1f2937",
      secondary: "#3a7ca5",
      background: "#f7f5f2",
      surface: "#ffffff",
      card: "#ffffff",
      border: "#d9d5d0",
      text: "#2f2a26",
      textMuted: "#7c746d",
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  indigo: {
    name: "Indigo",
    colors: {
      primary: "#c7d2fe",
      secondary: "#818cf8",
      background: "#0f172a",
      surface: "#1e293b",
      card: "#1f2a44",
      border: "#334155",
      text: "#e2e8f0",
      textMuted: "#94a3b8",
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
};

export type ThemeName = keyof typeof themeRegistry;
export const defaultThemeName: ThemeName = "dark";
