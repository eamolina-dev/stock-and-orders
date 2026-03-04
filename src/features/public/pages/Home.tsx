import { WhatsAppButton } from "../components/WhatsappButton";
import { LocationButton } from "../components/LocationButton";
import { Header } from "../../../components/layout/Header";
import { menus } from "../data";
import { config } from "../../../config";
import { Footer } from "../../../components/layout/Footer";
import { themes } from "../../../theme/themes";
import { CategoryFilter } from "../components/CategoryFilter";
import { useState } from "react";
import { CartButton } from "../components/CartButton";
import { CartPanel } from "../components/CartPanel";
import { CartProvider } from "../components/CartContext";
import { ItemSearch } from "../components/ItemSearch";
import { ShopCategory } from "../components/ShopCategory";

export const Home = () => {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const currentMenu = menus[config.clientId];
  const themeClass = themes[config.theme];

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredMenu = currentMenu
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        normalizeText(item.name).includes(normalizeText(search))
      ),
    }))
    .filter((cat) => cat.items.length > 0);

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
        <CategoryFilter
          categories={currentMenu.map((c) => ({ id: c.id, title: c.title }))}
        />
      )}

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {config.features.search && (
          <ItemSearch
            search={search}
            placeholder="Buscar bebida ..."
            setSearch={setSearch}
            setSearching={setSearching}
          />
        )}

        {filteredMenu.map((category) => (
          <ShopCategory
            key={category.id}
            category={category}
            showAddButton={config.features.cart}
          />
        ))}

        {filteredMenu.length === 0 && search.length > 0 && (
          <div className="text-center py-10 text-sm text-slate-400">
            No encontramos productos
          </div>
        )}
      </main>

      <Footer />

      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {config.features.whatsappButton && (
          <WhatsAppButton phone={config.phoneNumber} />
        )}

        {config.features.locationButton && (
          <LocationButton address={config.address} />
        )}

        {config.features.cart && <CartButton />}
      </div>

      {config.features.cart && <CartPanel />}
    </div>
  );

  return <CartProvider>{content}</CartProvider>;
};
