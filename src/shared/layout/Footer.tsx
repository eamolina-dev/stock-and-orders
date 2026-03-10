type FooterProps = {
  brandText?: string;
  description?: string;
  contactLabel?: string;
  contactValue?: string;
  contactHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  tone?: "default" | "highlight";
};

const toneStyles: Record<NonNullable<FooterProps["tone"]>, string> = {
  default:
    "bg-white/5 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.22)] text-white",
  highlight:
    "bg-amber-50/10 border-amber-300/30 shadow-[0_12px_36px_rgba(0,0,0,0.28)] text-white",
};

export const Footer = ({
  brandText = "Menú digital desarrollado por Agustín Molina",
  description = "Diseño, desarrollo e implementación de sistemas para negocios reales.",
  contactLabel = "Contacto",
  contactValue = "eamolina.dev@gmail.com",
  contactHref = "mailto:eamolina.dev@gmail.com",
  ctaLabel = "Hablemos",
  ctaHref = "mailto:eamolina.dev@gmail.com",
  className = "",
  tone = "default",
}: FooterProps) => {
  return (
    <footer className={`px-4 pb-10 pt-4 ${className}`}>
      <div
        className={`mx-auto max-w-3xl rounded-2xl border p-5 md:p-6 ${toneStyles[tone]}`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/65">
              {contactLabel}
            </p>
            <p className="text-sm font-semibold md:text-base">{brandText}</p>
            <p className="text-sm text-white/75">{description}</p>
            <a
              href={contactHref}
              className="inline-flex text-sm font-semibold text-amber-300 hover:text-amber-200"
            >
              {contactValue}
            </a>
          </div>

          <a
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-lg border border-amber-300/60 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200 hover:text-zinc-900"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </footer>
  );
};
