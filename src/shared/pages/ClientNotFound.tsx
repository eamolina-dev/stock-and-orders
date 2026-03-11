import { Link } from "react-router-dom";

type Props = {
  clientSlug?: string;
};

export function ClientNotFound({ clientSlug }: Props) {
  const shopUrl = clientSlug ? `/${clientSlug}` : "/";

  return (
    <div className="min-h-[40vh] p-6 flex flex-col items-center justify-center text-center gap-2">
      <h1 className="text-xl font-semibold">Tienda no encontrada</h1>
      <p className="text-sm text-zinc-500">
        Verificá el enlace o volvé al inicio.
      </p>
      <Link
        to={shopUrl}
        className="mt-2 inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
