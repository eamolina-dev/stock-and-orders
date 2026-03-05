import { useEffect, useMemo, useState } from "react";
import { Header } from "../../../core/layout/Header";
import { Footer } from "../../../core/layout/Footer";
import { ThemeSwitcher } from "../../../core/ui/ThemeSwitcher";
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
import { AdminShortcutButton } from "../components/AdminShortcutButton";

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
          items: cat.items.filter((item) => normalizeText(item.name).includes(normalizeText(search))),
        }))
        .filter((cat) => cat.items.length > 0),
    [menu, search]
  );

  const headerStyle = searching && search.length > 0 ? "hidden" : "";

  return (
    <CartProvider>
      <div className="menu-theme relative">
        <div className="fixed right-4 top-4 z-50">
          <ThemeSwitcher />
        </div>

        <Header
          name={clientName}
          description="Casa de bebidas"
          image="/pexels-maksgelatin-5748508.jpg"
          style={headerStyle}
        />

        <CategoryFilter categories={menu.map((c) => ({ id: c.id, title: c.title }))} />

        <main className="mx-auto max-w-2xl px-4 pb-24 pt-8">
          <ItemSearch
            search={search}
            placeholder="Buscar bebida ..."
            setSearch={setSearch}
            setSearching={setSearching}
          />

          {loading && <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">Cargando productos...</div>}

          {!loading &&
            filteredMenu.map((category) => (
              <ShopCategory key={category.id} category={category} showAddButton />
            ))}

          {!loading && filteredMenu.length === 0 && search.length > 0 && (
            <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">No encontramos productos</div>
          )}
        </main>

        <Footer />

        <AdminShortcutButton visible={isAdminSession} />
        <CartButton />
        <CartPanel />
      </div>
    </CartProvider>
  );
};
