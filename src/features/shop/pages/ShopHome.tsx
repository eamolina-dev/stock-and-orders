import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Shield } from "lucide-react";
import { Header } from "../../../shared/layout/Header";
import { Footer } from "../../../shared/layout/Footer";
import { themes } from "../../../theme/themes";
import { CartButton } from "../components/CartButton";
import { CartPanel } from "../components/CartPanel";
import { CartProvider } from "../components/CartContext";
import { ItemSearch } from "../components/ItemSearch";
import { ShopCategory } from "../components/ShopCategory";
import { getPublicMenu } from "../../../modules/items/queries";
import type { ShopCategory as ShopCategoryType } from "../../../modules/items/types";
import { isConfiguredAdmin } from "../../../shared/auth/admin";
import {
  getSession,
  subscribeToAuthChanges,
} from "../../../shared/auth/session";
import type { ClientShopLayoutContext } from "../layouts/ClientShopLayout";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ShopHome() {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState<ShopCategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { client, clientSlug } = useOutletContext<ClientShopLayoutContext>();

  useEffect(() => {
    let mounted = true;

    const loadPublicMenu = async () => {
      setLoading(true);
      try {
        const parsedMenu = await getPublicMenu(client.id);

        if (!mounted) return;
        setMenu(parsedMenu);

        const defaultCategory = parsedMenu.find(
          (category) => normalizeText(category.title) === normalizeText("Cervezas")
        );
        setSelectedCategoryId(defaultCategory?.id ?? parsedMenu[0]?.id ?? null);
      } catch {
        if (!mounted) return;
        setMenu([]);
        setSelectedCategoryId(null);
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
        <Header
          name={client.name ?? ""}
          description="Casa de bebidas"
          image="/pexels-maksgelatin-5748508.jpg"
          style={headerStyle}
        />

        <div className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur border-b">
          <div className="flex gap-2 overflow-x-auto px-4 py-3 max-w-2xl mx-auto">
            {menu.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                  selectedCategoryId === category.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/80 hover:bg-white"
                }`}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
          {isAdminSession && (
            <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-50 p-3 text-sm text-emerald-800">
              <Link
                to={`/${clientSlug}/admin`}
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
}
