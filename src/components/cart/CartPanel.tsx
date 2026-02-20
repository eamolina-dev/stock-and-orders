import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { config } from "../../config/index";

export const CartPanel = () => {
  const { cart, totalPrice, removeFromCart, increaseQty, clearCart } =
    useCart();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openCart = () => setOpen(true);
    window.addEventListener("open-cart", openCart);
    return () => window.removeEventListener("open-cart", openCart);
  }, []);

  if (!open) return null;
  if (cart.length === 0) return null;

  const message = encodeURIComponent(
    `Hola! Quiero pedir:\n\n${cart
      .map((i) => `${i.qty}x ${i.name}`)
      .join("\n")}\n\nTotal: $${totalPrice}`
  );

  const url = `https://wa.me/${config.phoneNumber}?text=${message}`;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex justify-center items-end"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl cart-panel rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold">Tu pedido</h2>

        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <span className="flex-1">
              {item.qty}x {item.name}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => removeFromCart(item.id)}
                className="qty-btn w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold"
              >
                −
              </button>

              <span className="min-w-[24px] text-center">{item.qty}</span>

              <button
                onClick={() => increaseQty(item.id)}
                className="qty-btn w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold"
              >
                +
              </button>
            </div>
          </div>
        ))}

        <div className="font-semibold cart-muted">Total: ${totalPrice}</div>

        {cart.length > 0 ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              clearCart();
              setOpen(false);
            }}
            className="action-btn block text-center py-3 rounded-xl font-semibold"
            // className="block text-center py-3 rounded-xl bg-green-600 text-white font-semibold"
          >
            Enviar pedido por WhatsApp
          </a>
        ) : (
          <button
            disabled
            className="disabled-btn block w-full text-center py-3 rounded-xl font-semibold cursor-not-allowed"
            // className="block w-full text-center py-3 rounded-xl bg-gray-300 text-gray-500 font-semibold cursor-not-allowed"
          >
            El carrito está vacío
          </button>
        )}

        <button onClick={clearCart} className="text-sm underline">
          Vaciar carrito
        </button>
      </div>
    </div>
  );
};
