import { useTheme } from "../../theme/use-theme";
import type { ThemeName } from "../../theme/themes";

export function ThemeSwitcher() {
  const { themeName, setTheme, availableThemes } = useTheme();

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text)]">
      Theme
      <select
        value={themeName}
        onChange={(event) => setTheme(event.target.value as ThemeName)}
        className="bg-transparent text-[var(--color-text)] outline-none"
        aria-label="Switch theme"
      >
        {availableThemes.map((themeOption) => (
          <option key={themeOption} value={themeOption} className="text-black">
            {themeOption}
          </option>
        ))}
      </select>
    </label>
  );
}
