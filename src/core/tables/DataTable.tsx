import type { ReactNode } from "react";

type Props = {
  columns: ReactNode;
  children: ReactNode;
  minWidthClassName?: string;
};

export function DataTable({ columns, children, minWidthClassName = "min-w-full" }: Props) {
  return (
    <table className={`${minWidthClassName} text-sm text-[var(--color-text)]`}>
      <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
        <tr>{columns}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
