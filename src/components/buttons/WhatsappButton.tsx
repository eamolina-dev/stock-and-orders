type Props = {
  phone: string;
};

export function WhatsAppButton({ phone }: Props) {
  // const phone = "5493584382061"; // número del negocio
  const message = encodeURIComponent(
    "¡Hola! Quiero hacer un pedido desde el menú digital 📋🍕"
  );

  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white transition">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-6 h-6 fill-white"
        >
          <path d="M16 .4C7.5.4.6 7.3.6 15.8c0 2.8.8 5.6 2.2 8L.4 32l8.4-2.3c2.3 1.3 5 2 7.7 2 8.5 0 15.4-6.9 15.4-15.4C31.4 7.3 24.5.4 16 .4zm0 28c-2.4 0-4.8-.7-6.8-2l-.5-.3-5 .1 1.4-4.9-.3-.5c-1.4-2.1-2.1-4.5-2.1-7 0-7.3 6-13.3 13.3-13.3S29.3 6.5 29.3 13.8 23.3 28.4 16 28.4zm7.5-9.9c-.4-.2-2.3-1.1-2.7-1.2s-.6-.2-.9.2c-.3.4-1 1.2-1.2 1.5s-.5.3-.9.1c-.4-.2-1.7-.6-3.2-2-1.2-1-2-2.3-2.2-2.7-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3 0-.6-.1-.8-.1-.2-.9-2.2-1.2-3-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 4s1.6 4.8 1.8 5.1c.2.3 3.2 5 7.7 7 .8.3 1.5.6 2 .8.8.3 1.6.3 2.2.2.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5z" />
        </svg>

        <span className="font-medium">Hacer pedido</span>
      </div>
    </a>
  );
}
