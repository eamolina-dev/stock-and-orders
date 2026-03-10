import { NavLink, useOutletContext, useSearchParams } from "react-router-dom";
import CategoriesTable from "../components/CategoriesTable";
import ProductsTable from "../components/ProductsTable";
import { signOut } from "../../../shared/auth/session";
import { themes } from "../../../theme/themes";
import { AdminNavbar } from "../../../shared/layout/AdminNavbar";
import type { ProtectedRouteContext } from "../components/ProtectedRoute";

const tabs = [
  { label: "Productos", value: "products" },
  { label: "Categorías", value: "categories" },
] as const;

export default function AdminDashboard() {
  const { clientId, clientSlug } = useOutletContext<ProtectedRouteContext>();
  const [searchParams] = useSearchParams();

  const activeTab =
    searchParams.get("tab") === "categories" ? "categories" : "products";

  const themeClass = themes.dark;

  return (
    <div className={`menu-theme ${themeClass} min-h-screen`}>
      <AdminNavbar clientSlug={clientSlug} variant="dashboard" onSignOut={signOut} />

      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.value}
              to={
                tab.value === "products"
                  ? `/${clientSlug}/admin/dashboard`
                  : `/${clientSlug}/admin/dashboard?tab=categories`
              }
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                activeTab === tab.value
                  ? "bg-white text-zinc-900"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="w-full bg-white text-zinc-900 rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
          {activeTab === "products" ? (
            <ProductsTable clientId={clientId} />
          ) : (
            <CategoriesTable clientId={clientId} />
          )}
        </div>
      </div>
    </div>
  );
}
