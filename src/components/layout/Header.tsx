import { useNavigate } from "react-router-dom";

type Props = {
  name: string;
  description: string;
  image?: string;
  style: string;
};

export const Header = ({ name, description, image, style }: Props) => {
  const navigate = useNavigate();
  const hasImage = !!image;

  return (
    <header
      className={`w-full text-center px-4 ${style} ${
        hasImage ? "relative h-56 md:h-72 overflow-hidden text-white" : "py-12"
      }`}
    >
      {hasImage && (
        <>
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </>
      )}

      {/* Botón flotante */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => navigate("/dashboard/products")}
          className="
            px-3 py-2 text-sm rounded-md
            bg-zinc-900/90 text-white backdrop-blur
            hover:bg-zinc-800
            transition
          "
        >
          Dashboard
        </button>
      </div>

      <div
        className={`relative z-10 ${
          hasImage ? "h-full flex flex-col justify-center" : ""
        }`}
      >
        <h1
          className={`font-title text-3xl md:text-5xl font-semibold tracking-wide`}
        >
          {name}
        </h1>

        <p className={`mt-2 ${hasImage ? "text-white/90" : "muted"}`}>
          {description}
        </p>
      </div>
    </header>
  );
};
