import { useState } from "react";
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

export const ShopItemCard = ({ item, showAddButton = true }: Props) => {
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
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] shadow-sm">
      <div className="aspect-square bg-[var(--color-surface)]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-muted)]">
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
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Stock: {item.stock}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={decrease}
            className="h-6 w-6 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-xs active:scale-95"
          >
            –
          </button>

          <span className="text-xs font-semibold w-4 text-center">{qty}</span>

          <button
            onClick={increase}
            className="h-6 w-6 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-xs active:scale-95"
          >
            +
          </button>
        </div>

        {showAddButton && (
          <button
            onClick={handleAdd}
            disabled={item.stock === 0}
            className="w-full rounded-lg bg-[var(--color-primary)] py-1.5 text-[11px] font-semibold text-[var(--color-bg)] active:scale-[0.98] disabled:opacity-40"
          >
            Agregar
          </button>
        )}
      </div>
    </div>
  );
};
