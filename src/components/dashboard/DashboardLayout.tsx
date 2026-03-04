import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <h1 className="text-xl font-semibold">Dashboard</h1>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="flex gap-2">
          <Tab to="/dashboard/products" label="Productos" />
          <Tab to="/dashboard/categories" label="Categorías" />
        </div>

        <div className="w-full bg-white text-zinc-900 rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
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
