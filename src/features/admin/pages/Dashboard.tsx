import { NavLink, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeedButton from "../../../SeedButton";
import CategoriesTable from "../../../components/tables/CategoriesTable";
import ProductsTable from "../../../components/tables/ProductsTable";
import { supabase } from "../../../lib/supabase";
import type { ProtectedRouteContext } from "../components/ProtectedRoute";

const tabs = [
  { label: "Productos", value: "products" },
  { label: "Categorías", value: "categories" },
] as const;

export default function AdminDashboard() {
  const { user } = useOutletContext<ProtectedRouteContext>();

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "categories" ? "categories" : "products";

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            <ArrowLeft size={16} />
            Volver al menú
          </NavLink>

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
          {tabs.map((tab) => (
            <NavLink
              key={tab.value}
              to={tab.value === "products" ? "/admin" : "/admin?tab=categories"}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                activeTab === tab.value
                  ? "bg-white text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="w-full bg-white text-zinc-900 rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
          {activeTab === "products" ? (
            <>
              <SeedButton />
              <ProductsTable userId={user.id} />
            </>
          ) : (
            <CategoriesTable userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}
