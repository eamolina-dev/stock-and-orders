import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  maxPage: number;
  onChange: (page: number) => void;
};

export function TablePagination({ page, maxPage, onChange }: Props) {
  return (
    <div className="flex justify-center gap-6 text-sm items-center">
      <ChevronLeft
        size={18}
        className={`cursor-pointer ${page === 0 ? "opacity-30" : ""}`}
        onClick={() => {
          if (page === 0) return;
          onChange(Math.max(0, page - 1));
        }}
      />

      <span className="text-zinc-500">
        Página {page + 1} / {maxPage + 1}
      </span>

      <ChevronRight
        size={18}
        className={`cursor-pointer ${page >= maxPage ? "opacity-30" : ""}`}
        onClick={() => {
          if (page >= maxPage) return;
          onChange(Math.min(page + 1, maxPage));
        }}
      />
    </div>
  );
}
