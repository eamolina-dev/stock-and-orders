import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

type Props = {
  visible: boolean;
};

export function AdminShortcutButton({ visible }: Props) {
  if (!visible) return null;

  return (
    <Link
      to="/admin"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
    >
      <Shield size={16} />
      Admin Panel
    </Link>
  );
}
