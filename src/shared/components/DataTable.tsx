import type { ReactNode } from "react";

type Props = {
  columns: ReactNode;
  children: ReactNode;
  minWidthClassName?: string;
};

export function DataTable({ columns, children, minWidthClassName = "min-w-full" }: Props) {
  return (
    <table className={`${minWidthClassName} text-sm`}>
      <thead className="bg-zinc-50 text-zinc-500">
        <tr>{columns}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
