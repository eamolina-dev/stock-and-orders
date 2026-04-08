import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Shield } from "lucide-react";
import { Header } from "../../../app/layout/Header";
import { Footer } from "../../../app/layout/Footer";
import { AdminNavbar } from "../../../app/layout/AdminNavbar";
import { themes } from "../../../shared/theme/themes";
import { CartButton } from "../../cart/components/CartButton";
import { CartPanel } from "../../cart/components/CartPanel";
import { CartProvider } from "../../cart/context/CartContext";
import { ItemSearch } from "../components/ItemSearch";
import { ShopCategory } from "../components/ShopCategory";
import { getPublicMenu } from "../../../features/products/api/queries";
import type { ShopCategory as ShopCategoryType } from "../../../features/products/types";
import { isConfiguredAdmin } from "../../../features/auth/services/admin";
import {
  getSession,
  subscribeToAuthChanges,
} from "../../../features/auth/services/session";
import type { ClientShopLayoutContext } from "../../../app/layout/ClientShopLayout";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

type HomeProps = {
  adminMode?: boolean;
};

export default function ShopHome({ adminMode = false }: HomeProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState<ShopCategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const { client, clientSlug } = useOutletContext<ClientShopLayoutContext>();

  useEffect(() => {
    const debounceTimeout = window.setTimeout(() => {
      setSearch(searchInput);
    }, 250);

    return () => {
      window.clearTimeout(debounceTimeout);
    };
  }, [searchInput]);

  useEffect(() => {
    let mounted = true;

    const loadPublicMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsedMenu = await getPublicMenu(client.id);

        if (!mounted) return;
        setMenu(parsedMenu);

        const safeMenu = parsedMenu ?? [];

        const defaultCategory = safeMenu.find(
          (category) =>
            normalizeText(category.title) === normalizeText("Cervezas")
        );
        setSelectedCategoryId(defaultCategory?.id ?? safeMenu[0]?.id ?? null);
      } catch (menuError) {
        console.error("Error loading public menu", menuError);
        if (!mounted) return;
        setMenu([]);
        setSelectedCategoryId(null);
        setError("Error al cargar los datos");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const syncSession = async () => {
      try {
        const session = await getSession();
        if (!mounted) return;
        setIsAdminSession(isConfiguredAdmin(session?.user?.email));
      } catch (sessionError) {
        console.error("Error syncing auth session", sessionError);
      }
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
  }, [client.id]);

  const filteredMenu = useMemo(
    () =>
      menu
        .filter((cat) => !selectedCategoryId || cat.id === selectedCategoryId)
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            normalizeText(item.name).includes(normalizeText(search))
          ),
        }))
        .filter((cat) => cat.items.length > 0),
    [menu, search, selectedCategoryId]
  );

  const themeClass = themes.dark;
  const headerStyle = searching && search.length > 0 ? "hidden" : "";

  return (
    <CartProvider>
      <div className={`menu-theme ${themeClass} min-h-screen relative`}>
        {adminMode && <AdminNavbar clientSlug={clientSlug} variant="shop" />}

        <Header
          name={client.name ?? ""}
          description="Casa de bebidas"
          style={headerStyle}
        />

        <div className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur border-b">
          <div className="shop-category-scroll flex gap-2 overflow-x-auto px-4 py-3 max-w-2xl mx-auto">
            {(menu ?? []).map((category) => (
              <button
                key={category.id}
                type="button"
                className={`px-4 py-2.5 rounded-full border text-sm whitespace-nowrap transition min-h-10 ${
                  selectedCategoryId === category.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/40 hover:bg-black"
                }`}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
          {!adminMode && isAdminSession && (
            <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-50 p-3 text-sm text-emerald-800">
              <Link
                to={`/${clientSlug}/admin/dashboard`}
                className="inline-flex items-center gap-2 font-semibold hover:underline"
              >
                <Shield size={14} />
                Estás navegando como admin. Ir al dashboard.
              </Link>
            </div>
          )}

          <ItemSearch
            search={searchInput}
            placeholder="Buscar bebida ..."
            setSearch={setSearchInput}
            setSearching={setSearching}
          />

          {loading && (
            <div className="text-center py-10 text-sm text-slate-400">
              Cargando productos...
            </div>
          )}

          {!loading &&
            (filteredMenu ?? []).map((category) => (
              <ShopCategory
                key={category.id}
                category={category}
                showAddButton
              />
            ))}

          {error && (
            <div className="text-center py-4 text-sm text-red-500">{error}</div>
          )}

          {!loading && filteredMenu.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">
              No se encontraron productos
            </div>
          )}
        </main>

        <Footer />

        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <CartButton />
        </div>

        <CartPanel phoneNumber={client.phone_number} />
      </div>
    </CartProvider>
  );
}
