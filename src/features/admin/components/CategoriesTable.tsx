import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../core/tables/DataTable";
import { TablePagination } from "../../../core/tables/TablePagination";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../../modules/categories/queries";
import type { CategoryEntity } from "../../../modules/categories/types";

type Props = { userId: string };

const PAGE_SIZE = 10;

export default function CategoriesTable({ userId }: Props) {
  const [items, setItems] = useState<CategoryEntity[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<CategoryEntity>>>({});
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  useEffect(() => {
    load(page);
  }, [page]);

  const load = async (nextPage = 0) => {
    const from = nextPage * PAGE_SIZE;
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
    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], name: value } }));
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: value } : item)));
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
            return createCategory({ name: data.name ?? null, user_id: userId });
          }
          return updateCategory(id, { name: data.name ?? null });
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
    const newItem = { id: tempId, name: "" } as CategoryEntity;

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
    return items.filter((item) => (item.name ?? "").toLowerCase().includes(filter.toLowerCase()));
  }, [items, filter]);

  return (
    <div className="p-4 flex flex-col gap-4 min-w-[800px]">
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
          className={`px-4 py-2 text-sm rounded-md transition ${
            hasChanges && !hasErrors ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          Guardar cambios
        </button>
      </div>

      <button onClick={handleAddRow} className="self-start px-4 py-2 text-sm rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
        + Agregar categoría
      </button>

      {message && <div className="text-sm text-emerald-600">{message}</div>}
      {hasErrors && <div className="text-sm text-red-500">Todas las categorías deben tener nombre</div>}

      <div className="border border-zinc-200 rounded-lg bg-white">
        <div className="overflow-x-auto">
          <DataTable
            columns={
              <>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="px-3 py-2 w-20"></th>
              </>
            }
          >
            {filteredItems.map((item, i) => {
              const isEdited = edited[item.id];
              return (
                <tr
                  key={item.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-zinc-50"} hover:bg-emerald-50 transition-colors ${isEdited ? "ring-1 ring-amber-400" : ""}`}
                >
                  <td className="px-3 py-2">
                    <input value={item.name || ""} onChange={(e) => handleChange(item.id, e.target.value)} className="w-full bg-transparent outline-none px-2 py-1 rounded" />
                  </td>

                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400">
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      </div>

      <TablePagination page={page} maxPage={maxPage} onChange={setPage} />
    </div>
  );
}
