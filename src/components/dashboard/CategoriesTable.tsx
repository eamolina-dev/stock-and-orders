import { useEffect, useState, useMemo } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../lib/categories";
import type { Category } from "../../types/types";

type Props = {
  userId: string;
};

export default function CategoriesTable({ userId }: Props) {
  const [items, setItems] = useState<Category[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<Category>>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getCategories();
    setItems(data);
    setEdited({});
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

    load();
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
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;

    return items.filter((item) =>
      (item.name ?? "").toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex justify-between gap-2">
        <input
          placeholder="Filtrar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          disabled={!hasChanges || hasErrors}
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

      {/* Tabla */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2 w-20"></th>
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
                      ${isEdited ? "ring-1 ring-amber-400" : ""}
                    `}
                  >
                    <td className="px-3 py-2">
                      <input
                        value={item.name || ""}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        placeholder="Nombre de categoría"
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

      {hasErrors && (
        <div className="text-sm text-red-500">
          Todas las categorías deben tener nombre
        </div>
      )}
    </div>
  );
}
