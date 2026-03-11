import { memo, useState } from "react";
import { useCart } from "./CartContext";

type Item = {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock?: number;
};

type Props = {
  item: Item;
  showAddButton?: boolean;
};

const ShopItemCardComponent = ({ item, showAddButton = true }: Props) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const increase = () => {
    setQty((q) => (item.stock ? Math.min(item.stock, q + 1) : q + 1));
  };

  const decrease = () => {
    setQty((q) => Math.max(1, q - 1));
  };

  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: qty,
    });
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-slate-900">
      <div className="aspect-square bg-gray-100">
        {item.image && !imageError ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              setImageError(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-2 space-y-1.5">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">
          {item.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">${item.price}</span>

          {typeof item.stock === "number" && (
            <span className="text-[10px] text-gray-500">Stock: {item.stock}</span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={decrease}
            aria-label="Disminuir cantidad"
            className="w-8 h-8 rounded border text-sm active:scale-95"
          >
            –
          </button>

          <span className="text-xs font-semibold w-4 text-center">{qty}</span>

          <button
            onClick={increase}
            aria-label="Aumentar cantidad"
            className="w-8 h-8 rounded border text-sm active:scale-95"
          >
            +
          </button>
        </div>

        {showAddButton && (
          <button
            onClick={handleAdd}
            disabled={item.stock === 0}
            className="w-full text-xs py-2 rounded-lg bg-slate-900 text-white font-semibold disabled:opacity-40 active:scale-[0.98]"
          >
            Agregar
          </button>
        )}
      </div>
    </div>
  );
};

export const ShopItemCard = memo(ShopItemCardComponent);
