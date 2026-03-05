import { NavLink, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CategoriesTable from "../components/CategoriesTable";
import ProductsTable from "../components/ProductsTable";
import { signOut } from "../../../core/auth/session";
import type { ProtectedRouteContext } from "../components/ProtectedRoute";
import { ThemeSwitcher } from "../../../core/ui/ThemeSwitcher";

const tabs = [
  { label: "Productos", value: "products" },
  { label: "Categorías", value: "categories" },
] as const;

export default function AdminDashboard() {
  const { clientId } = useOutletContext<ProtectedRouteContext>();
  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") === "categories" ? "categories" : "products";

  return (
    <div className="menu-theme min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
          >
            <ArrowLeft size={16} />
            Volver al menú
          </NavLink>

          <h1 className="text-xl font-semibold">Dashboard</h1>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.value}
              to={tab.value === "products" ? "/admin" : "/admin?tab=categories"}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                activeTab === tab.value
                  ? "bg-[var(--color-primary)] text-[var(--color-bg)]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] shadow-sm">
          {activeTab === "products" ? <ProductsTable clientId={clientId} /> : <CategoriesTable clientId={clientId} />}
        </div>
      </div>
    </div>
  );
}
