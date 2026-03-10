import { Link } from "react-router-dom";

type Props = {
  clientSlug: string;
  variant: "shop" | "dashboard";
  onSignOut?: () => void;
};

export function AdminNavbar({ clientSlug, variant, onSignOut }: Props) {
  if (variant === "shop") {
    return (
      <div className="z-50 bg-black text-white text-sm px-4 py-3 flex items-center justify-between border-b border-white/20">
        <span className="font-semibold">Modo administrador</span>
        <Link
          to={`/${clientSlug}/admin/dashboard`}
          className="rounded-md border border-white/40 px-3 py-1.5 font-semibold hover:bg-white hover:text-black"
        >
          Ir al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="z-50 bg-black text-white text-sm px-4 py-3 flex items-center justify-between border-b border-white/20">
      <Link
        to={`/${clientSlug}/admin/shop`}
        className="rounded-md border border-white/40 px-3 py-1.5 font-semibold hover:bg-white hover:text-black"
      >
        Ver tienda
      </Link>

      <button
        type="button"
        onClick={onSignOut}
        className="rounded-md border border-white/40 px-3 py-1.5 font-semibold hover:bg-white hover:text-black"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
