import { useCart } from "../../context/CartContext";

export const CartButton = () => {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      className="fixed bottom-6 left-6 z-50 px-5 py-3 rounded-full shadow-lg border backdrop-blur floating-btn"
      onClick={() => window.dispatchEvent(new Event("open-cart"))}
    >
      🛒 Ver pedido ({totalItems})
    </button>
  );
};
