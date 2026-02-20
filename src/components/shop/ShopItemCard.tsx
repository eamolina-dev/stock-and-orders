import { useState } from "react";
import { useCart } from "../../context/CartContext";

type Item = {
  id: number;
  name: string;
  price: number;
  image?: string;
  stock?: number;
};

type Props = {
  item: Item;
  showAddButton?: boolean;
};

export const ShopItemCard = ({ item }: Props) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

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
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover"
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
          <span className="text-base font-bold tracking-tight">
            ${item.price}
          </span>

          {typeof item.stock === "number" && (
            <span className="text-[10px] text-gray-500">
              Stock: {item.stock}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={decrease}
            className="w-6 h-6 rounded border text-xs active:scale-95"
          >
            –
          </button>

          <span className="text-xs font-semibold w-4 text-center">{qty}</span>

          <button
            onClick={increase}
            className="w-6 h-6 rounded border text-xs active:scale-95"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={item.stock === 0}
          className="w-full text-[11px] py-1.5 rounded-lg bg-slate-900 text-white font-semibold disabled:opacity-40 active:scale-[0.98]"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};
