type Props = {
  categories: { id: string; title: string }[];
};

export const CategoryFilter = ({ categories }: Props) => {
  return (
    <div className="sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur border-b border-[var(--color-border)]">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 max-w-2xl mx-auto">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="whitespace-nowrap rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)] transition hover:scale-105"
          >
            {cat.title}
          </a>
        ))}
      </div>
    </div>
  );
};
