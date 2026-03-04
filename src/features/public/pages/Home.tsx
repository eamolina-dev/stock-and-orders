import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { WhatsAppButton } from "../components/WhatsappButton";
import { LocationButton } from "../components/LocationButton";
import { Header } from "../../../components/layout/Header";
import { config } from "../../../config";
import { Footer } from "../../../components/layout/Footer";
import { themes } from "../../../theme/themes";
import { CategoryFilter } from "../components/CategoryFilter";
import { CartButton } from "../components/CartButton";
import { CartPanel } from "../components/CartPanel";
import { CartProvider } from "../components/CartContext";
import { ItemSearch } from "../components/ItemSearch";
import { ShopCategory } from "../components/ShopCategory";
import type { MenuCategory } from "../types/menu";
import { supabase } from "../../../lib/supabase";
import { isConfiguredAdmin } from "../../../lib/auth";

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

  useEffect(() => {
    let mounted = true;

    const loadPublicMenu = async () => {
      setLoading(true);

      const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
        await Promise.all([
          supabase.from("categories").select("id, name").order("name"),
          supabase
            .from("products")
            .select("id, name, price, image_url, category_id")
            .order("name"),
        ]);

      if (!mounted) return;

      if (categoriesError || productsError) {
        setMenu([]);
        setLoading(false);
        return;
      }

      const productsByCategory = new Map<string, MenuCategory["items"]>();

      for (const product of products ?? []) {
        if (!product.category_id || !product.name || typeof product.price !== "number") continue;

        const categoryItems = productsByCategory.get(product.category_id) ?? [];
        categoryItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url ?? undefined,
        });
        productsByCategory.set(product.category_id, categoryItems);
      }

      const parsedMenu: MenuCategory[] = (categories ?? [])
        .map((category) => ({
          id: category.id,
          title: category.name ?? "Sin nombre",
          items: productsByCategory.get(category.id) ?? [],
        }))
        .filter((category) => category.items.length > 0);

      setMenu(parsedMenu);
      setLoading(false);
    };

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setIsAdminSession(isConfiguredAdmin(session?.user?.email));
    };

    loadPublicMenu();
    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminSession(isConfiguredAdmin(session?.user?.email));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
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

  const themeClass = themes[config.theme];
  const headerStyle = searching && search.length > 0 ? "hidden" : "";

  const content = (
    <div className={`menu-theme ${themeClass} min-h-screen relative`}>
      <Header
        name={config.clientName}
        description={config.description}
        image="/pexels-maksgelatin-5748508.jpg"
        style={headerStyle}
      />

      {config.features.categoryFilter && (
        <CategoryFilter categories={menu.map((c) => ({ id: c.id, title: c.title }))} />
      )}

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {isAdminSession && (
          <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-50 p-3 text-sm text-emerald-800">
            <Link to="/admin" className="inline-flex items-center gap-2 font-semibold hover:underline">
              <Shield size={14} />
              Estás navegando como admin. Ir al dashboard.
            </Link>
          </div>
        )}

        {config.features.search && (
          <ItemSearch
            search={search}
            placeholder="Buscar bebida ..."
            setSearch={setSearch}
            setSearching={setSearching}
          />
        )}

        {loading && <div className="text-center py-10 text-sm text-slate-400">Cargando productos...</div>}

        {!loading &&
          filteredMenu.map((category) => (
            <ShopCategory key={category.id} category={category} showAddButton={config.features.cart} />
          ))}

        {!loading && filteredMenu.length === 0 && search.length > 0 && (
          <div className="text-center py-10 text-sm text-slate-400">No encontramos productos</div>
        )}
      </main>

      <Footer />

      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {config.features.whatsappButton && <WhatsAppButton phone={config.phoneNumber} />}

        {config.features.locationButton && <LocationButton address={config.address} />}

        {config.features.cart && <CartButton />}
      </div>

      {config.features.cart && <CartPanel />}
    </div>
  );

  return <CartProvider>{content}</CartProvider>;
};
