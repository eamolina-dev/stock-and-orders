import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { themes } from "../../../theme/themes";
import { signInWithPassword } from "../../../shared/auth/session";

type LocationState = {
  from?: string;
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from;

  const themeClass = themes.dark;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signInWithPassword(email, password);

    if (signInError) {
      setError("Usuario o contraseña incorrectos.");
      setIsSubmitting(false);
      return;
    }

    navigate(from || "/admin", { replace: true });
  };

  return (
    <div className={`menu-theme ${themeClass} min-h-screen px-4 py-8`}>
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-300/70 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="card rounded-2xl border p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] accent">
            Acceso administrador
          </p>
          <h1 className="title mt-2 text-2xl font-title">Panel de edición</h1>
          <p className="muted mt-2 text-sm">
            Ingresá con tu cuenta administradora para gestionar la tienda.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Contraseña
              </label>
              <input
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="action-btn w-full rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-70"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar al panel"}
            </button>
          </form>

          <p className="muted mt-6 text-center text-xs">
            ¿Volver al menú público?{" "}
            <Link className="accent font-semibold" to="/">
              Ir al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
