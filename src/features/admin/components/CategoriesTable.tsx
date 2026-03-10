import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../shared/tables/DataTable";
import { TablePagination } from "../../../shared/tables/TablePagination";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../../modules/categories/queries";
import type { CategoryEntity } from "../../../modules/categories/types";

type Props = { clientId: string };

const PAGE_SIZE = 10;

export default function CategoriesTable({ clientId }: Props) {
  const [items, setItems] = useState<CategoryEntity[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<CategoryEntity>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { rows } = await getCategories(clientId, { from: 0, to: 9999 });

    setItems(rows);
    setEdited({});
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

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
            return createCategory({ name: data.name ?? null, client_id: clientId });
          }
          return updateCategory(id, { name: data.name ?? null });
        })
      );

      notify("Cambios guardados");
      load();
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
      load();
    } catch {
      notify("No se pudo eliminar");
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return items.filter((item) =>
      (item.name ?? "").toLowerCase().includes(normalizedSearchTerm)
    );
  }, [items, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const maxPage = Math.max(0, Math.ceil(filteredItems.length / PAGE_SIZE) - 1);

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const paginatedItems = useMemo(() => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    return filteredItems.slice(from, to);
  }, [filteredItems, page]);

  return (
    <div className="p-4 flex flex-col gap-4 min-w-[800px]">
      <div className="flex items-center justify-between gap-2">
        <input
          placeholder="Filtrar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            {paginatedItems.map((item, i) => {
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
