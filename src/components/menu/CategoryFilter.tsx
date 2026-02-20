type Props = {
  categories: { id: string; title: string }[];
};

export const CategoryFilter = ({ categories }: Props) => {
  return (
    <div className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur border-b">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 max-w-2xl mx-auto">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="px-4 py-2 rounded-full border text-sm whitespace-nowrap hover:scale-105 transition"
          >
            {cat.title}
          </a>
        ))}
      </div>
    </div>
  );
};
