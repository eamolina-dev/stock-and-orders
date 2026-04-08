type Props = {
  name: string;
  style?: string;
};

export const Header = ({ name, style = "" }: Props) => {
  return (
    <header
      className={`w-full text-center px-4 py-12 bg-black border-b border-white/10 ${style}`}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <img
          src="/logo.webp"
          alt={name}
          className="h-16 md:h-24 w-auto object-contain drop-shadow-lg"
        />
      </div>
    </header>
  );
};
