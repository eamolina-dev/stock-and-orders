import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Header } from "../../../core/layout/Header";
import { Footer } from "../../../core/layout/Footer";
import { themes } from "../../../theme/themes";
import { CategoryFilter } from "../components/CategoryFilter";
import { CartButton } from "../components/CartButton";
import { CartPanel } from "../components/CartPanel";
import { CartProvider } from "../components/CartContext";
import { ItemSearch } from "../components/ItemSearch";
import { ShopCategory } from "../components/ShopCategory";
import { getPublicMenu } from "../../../modules/items/queries";
import type { MenuCategory } from "../../../modules/items/types";
import { isConfiguredAdmin } from "../../../core/auth/admin";
import { getSession, subscribeToAuthChanges } from "../../../core/auth/session";
import { resolvePublicClient } from "../../../core/client/resolution";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const Home = () => {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [clientName, setClientName] = useState("toma.");
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");

  useEffect(() => {
    let mounted = true;

    const loadPublicMenu = async () => {
      setLoading(true);
      try {
        const client = await resolvePublicClient();
        if (!client?.id) {
          if (!mounted) return;
          setMenu([]);
          return;
        }

        const parsedMenu = await getPublicMenu(client.id);
        if (!mounted) return;
        if (client.name) setClientName(client.name);
        setMenu(parsedMenu);
      } catch {
        if (!mounted) return;
        setMenu([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const syncSession = async () => {
      const session = await getSession();
      if (!mounted) return;
      setIsAdminSession(isConfiguredAdmin(session?.user?.email));
    };

    loadPublicMenu();
    syncSession();

    const subscription = subscribeToAuthChanges((_event, session) => {
      setIsAdminSession(isConfiguredAdmin(session?.user?.email));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const filteredMenu = useMemo(
    () =>
      menu
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            normalizeText(item.name).includes(normalizeText(search))
          ),
        }))
        .filter((cat) => cat.items.length > 0),
    [menu, search]
  );

  const themeClass = themes.dark;
  const headerStyle = searching && search.length > 0 ? "hidden" : "";

  return (
    <CartProvider>
      <div className={`menu-theme ${themeClass} min-h-screen relative`}>
        {isAdminView && (
          <Link
            to="/admin/dashboard"
            className="fixed top-6 right-6 z-50 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow"
          >
            Panel de edición
          </Link>
        )}

        <Header
          name={clientName}
          description="Casa de bebidas"
          image="/pexels-maksgelatin-5748508.jpg"
          style={headerStyle}
        />

        <CategoryFilter
          categories={menu.map((c) => ({ id: c.id, title: c.title }))}
        />

        <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
          {isAdminSession && (
            <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-50 p-3 text-sm text-emerald-800">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 font-semibold hover:underline"
              >
                <Shield size={14} />
                Estás navegando como admin. Ir al dashboard.
              </Link>
            </div>
          )}

          <ItemSearch
            search={search}
            placeholder="Buscar bebida ..."
            setSearch={setSearch}
            setSearching={setSearching}
          />

          {loading && (
            <div className="text-center py-10 text-sm text-slate-400">
              Cargando productos...
            </div>
          )}

          {!loading &&
            filteredMenu.map((category) => (
              <ShopCategory
                key={category.id}
                category={category}
                showAddButton
              />
            ))}

          {!loading && filteredMenu.length === 0 && search.length > 0 && (
            <div className="text-center py-10 text-sm text-slate-400">
              No encontramos productos
            </div>
          )}
        </main>

        <Footer />

        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <CartButton />
        </div>

        <CartPanel />
      </div>
    </CartProvider>
  );
};
