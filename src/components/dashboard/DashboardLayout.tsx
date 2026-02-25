import { NavLink } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Tab to="/dashboard/products" label="Productos" />
          <Tab to="/dashboard/categories" label="Categorías" />
        </div>

        {/* Content Panel */}
        <div
          className="
          bg-white 
          text-zinc-900 
          rounded-xl 
          border border-zinc-200 
          shadow-sm
        "
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        px-3 py-1.5 text-sm rounded-md transition
        ${
          isActive
            ? "bg-white text-zinc-900"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        }
        `
      }
    >
      {label}
    </NavLink>
  );
}
