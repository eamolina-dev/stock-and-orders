import type { MenuItemProps as MenuItemType } from "../../data/menuData";
import { useCart } from "../../context/CartContext";

type Props = {
  item: MenuItemType;
  showAddButton?: boolean;
};

export const MenuItem = ({ item, showAddButton }: Props) => {
  const { addToCart } = useCart();

  return (
    <div className="card rounded-2xl shadow-sm overflow-hidden border">
      <div className="flex">
        {/* Imagen opcional */}
        {/* ESTAR ATENTO AL RESPONSIVE CON LAS IMAGENES */}
        {item.image && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="p-4 space-y-2 flex-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="title text-lg font-semibold leading-snug">
              {item.name}
            </h3>

            <span className="price accent text-base font-semibold whitespace-nowrap">
              ${item.price}
            </span>
          </div>

          {item.description && (
            <p className="muted text-sm leading-relaxed">{item.description}</p>
          )}

          {showAddButton && (
            <button
              onClick={() =>
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  qty: 0,
                })
              }
              className="mt-2 text-sm px-3 py-1 rounded-lg border hover:scale-105 transition"
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
