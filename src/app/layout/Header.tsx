type Props = {
  name: string;
  description: string;
  image?: string;
  style: string;
};

export const Header = ({ name, description, image, style }: Props) => {
  const hasImage = !!image;

  return (
    <header
      className={`w-full text-center px-4 bg-black/75 border-b border-white/10 ${style} ${
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
