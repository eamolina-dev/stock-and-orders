import { useEffect, useState, useMemo } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../lib/categories";
import type { Category } from "../../types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  userId: string;
};

const PAGE_SIZE = 10;

export default function CategoriesTable({ userId }: Props) {
  const [items, setItems] = useState<Category[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<Category>>>({});
  const [filter, setFilter] = useState("");

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  useEffect(() => {
    load(page);
  }, [page]);

  const load = async (page = 0) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { rows, count } = await getCategories({ from, to });

    setItems(rows);
    setTotal(count);
    setEdited({});
  };

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleChange = (id: string, value: string) => {
    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], name: value },
    }));

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: value } : item))
    );
  };

  const hasChanges = Object.keys(edited).length > 0;
  const hasErrors = items.some((item) => !(item.name ?? "").trim());

  const handleSave = async () => {
    if (hasErrors) return;

    setSaving(true);

    try {
      await Promise.all(
        Object.entries(edited).map(([id, data]) => {
          if (id.startsWith("temp_")) {
            return createCategory({
              name: data.name ?? null,
              user_id: userId,
            });
          }

          return updateCategory(id, {
            name: data.name ?? null,
          });
        })
      );

      notify("Cambios guardados");
      load(page);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRow = () => {
    const tempId = `temp_${Date.now()}`;

    const newItem = {
      id: tempId,
      name: "",
    } as Category;

    setItems((prev) => [newItem, ...prev]);
    setEdited((prev) => ({ ...prev, [tempId]: newItem }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar categoría?")) return;

    try {
      if (id.startsWith("temp_")) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setEdited((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        return;
      }

      await deleteCategory(id);

      notify("Categoría eliminada");
      load(page);
    } catch {
      notify("No se pudo eliminar");
    }
  };

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;

    return items.filter((item) =>
      (item.name ?? "").toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <div className="p-4 flex flex-col gap-4 min-w-[800px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <input
          placeholder="Filtrar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          disabled={saving || !hasChanges || hasErrors}
          onClick={handleSave}
          className={`
            px-4 py-2 text-sm rounded-md transition
            ${
              hasChanges && !hasErrors
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            }
          `}
        >
          Guardar cambios
        </button>
      </div>

      <button
        onClick={handleAddRow}
        className="self-start px-4 py-2 text-sm rounded-md bg-zinc-900 text-white hover:bg-zinc-800"
      >
        + Agregar categoría
      </button>

      {message && <div className="text-sm text-emerald-600">{message}</div>}

      {hasErrors && (
        <div className="text-sm text-red-500">
          Todas las categorías deben tener nombre
        </div>
      )}

      {/* Layout scroll sano */}
      <div className="border border-zinc-200 rounded-lg bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="px-3 py-2 w-20"></th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item, i) => {
                const isEdited = edited[item.id];

                return (
                  <tr
                    key={item.id}
                    className={`
                      ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}
                      hover:bg-emerald-50
                      transition-colors
                      ${isEdited ? "ring-1 ring-amber-400" : ""}
                    `}
                  >
                    <td className="px-3 py-2">
                      <input
                        value={item.name || ""}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        className="w-full bg-transparent outline-none px-2 py-1 rounded"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación minimal */}
      <div className="flex justify-center gap-6 text-sm items-center">
        <ChevronLeft
          size={18}
          className={`cursor-pointer ${page === 0 ? "opacity-30" : ""}`}
          onClick={() => {
            if (page === 0) return;
            setPage((p) => Math.max(0, p - 1));
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
            setPage((p) => Math.min(p + 1, maxPage));
          }}
        />
      </div>
    </div>
  );
}
