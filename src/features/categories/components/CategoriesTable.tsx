import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "../../../shared/components/DataTable";
import { TablePagination } from "../../../shared/components/TablePagination";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../../features/categories/api/queries";
import { InlineAlert } from "../../../shared/components/InlineAlert";
import type { CategoryEntity } from "../../../features/categories/types";

type Props = { clientId: string };

const PAGE_SIZE = 10;

export default function CategoriesTable({ clientId }: Props) {
  const [items, setItems] = useState<CategoryEntity[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<CategoryEntity>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const originalItemsRef = useRef<Record<string, CategoryEntity>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { rows } = await getCategories(clientId, { from: 0, to: 9999 });

      const mappedRows = rows ?? [];
      originalItemsRef.current = Object.fromEntries(
        mappedRows.map((item) => [item.id, item])
      );
      setItems(mappedRows);
      setEdited({});
    } catch (loadError) {
      console.error("Error loading categories", loadError);
      setItems([]);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (text: string) => {
    setError(null);
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  };

  const notifyError = (text: string) => {
    setMessage(null);
    setError(text);
    setTimeout(() => setError(null), 3000);
  };

  const handleChange = (id: string, value: string) => {
    setSaveAttempted(false);
    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], name: value } }));
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: value } : item)));
  };

  const hasChanges = Object.keys(edited).length > 0;
  const hasErrors = items.some((item) => !(item.name ?? "").trim());

  const handleSave = async () => {
    setSaveAttempted(true);
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
      setSaveAttempted(false);
      load();
    } catch (saveError) {
      console.error("Error saving categories", saveError);
      notifyError("Error al cargar los datos");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRow = () => {
    setSaveAttempted(false);
    setSearchTerm("");
    setPage(0);

    const existingUnsaved = items.find((item) => item.id.startsWith("temp_"));
    if (existingUnsaved) {
      const targetRow = rowRefs.current[existingUnsaved.id];
      targetRow?.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = targetRow?.querySelector("input") as HTMLInputElement | null;
      input?.focus();
      notifyError("Tenés cambios sin guardar");
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const newItem = { id: tempId, name: "" } as CategoryEntity;

    setItems((prev) => [newItem, ...prev]);
    setEdited((prev) => ({ ...prev, [tempId]: newItem }));

    setTimeout(() => {
      const targetRow = rowRefs.current[tempId];
      targetRow?.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = targetRow?.querySelector("input") as HTMLInputElement | null;
      input?.focus();
    }, 0);
  };

  const handleCancelUnsaved = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setEdited((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleCancelRow = (id: string) => {
    if (id.startsWith("temp_")) {
      handleCancelUnsaved(id);
      return;
    }

    const originalItem = originalItemsRef.current[id];
    if (!originalItem) return;

    setItems((prev) => prev.map((item) => (item.id === id ? originalItem : item)));
    setEdited((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleSaveRow = async (id: string) => {
    const row = items.find((item) => item.id === id);
    if (!row || !(row.name ?? "").trim() || !edited[id]) return;

    setSaving(true);
    try {
      if (id.startsWith("temp_")) {
        await createCategory({ name: row.name ?? null, client_id: clientId });
        notify("Cambios guardados");
      } else {
        await updateCategory(id, { name: edited[id].name ?? null });
        notify("Cambios guardados");
      }
      await load();
    } catch (saveError) {
      console.error("Error saving category row", saveError);
      notifyError("Error al cargar los datos");
    } finally {
      setSaving(false);
    }
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSaveRow(id);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelRow(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que querés eliminar esta categoría?")) return;

    try {
      if (id.startsWith("temp_")) {
        handleCancelUnsaved(id);
        return;
      }

      await deleteCategory(id);
      notify("Categoría eliminada");
      load();
    } catch (deleteError) {
      console.error("Error deleting category", deleteError);
      notifyError("Error al cargar los datos");
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
          aria-label="Buscar categoría"
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
          Guardar
        </button>
      </div>

      <button onClick={handleAddRow} className="self-start px-4 py-2 text-sm rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
        + Agregar categoría
      </button>

      {message && <InlineAlert tone="success" message={message} />}
      {error && <InlineAlert tone="error" message={error} />}
      {hasErrors && saveAttempted && <div className="text-sm text-red-500">Todas las categorías deben tener nombre</div>}
      <p className="text-sm text-zinc-500">Mostrando {filteredItems.length} de {items.length} categorías</p>
      {loading && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
          Cargando categorías...
        </div>
      )}

      {!loading && <div className="border border-zinc-200 rounded-lg bg-white">
        <div className="overflow-x-auto">
          <DataTable
            columns={
              <>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="px-3 py-2 w-24">Acciones</th>
              </>
            }
          >
            {paginatedItems.map((item, i) => {
              const isEdited = edited[item.id];
              return (
                <tr
                  key={item.id}
                  ref={(node) => {
                    rowRefs.current[item.id] = node;
                  }}
                  className={`${item.id.startsWith("temp_") ? "bg-amber-50" : i % 2 === 0 ? "bg-zinc-50" : "bg-zinc-100"} hover:bg-emerald-50 transition-colors ${isEdited || item.id.startsWith("temp_") ? "ring-1 ring-amber-400" : ""}`}
                >
                  <td className="px-3 py-2">
                    <div className="relative">
                      {item.id.startsWith("temp_") && (
                        <span className="pointer-events-none absolute -top-2 left-2 rounded bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Nuevo
                        </span>
                      )}
                      <input value={item.name || ""} onChange={(e) => handleChange(item.id, e.target.value)} onKeyDown={(e) => handleRowKeyDown(e, item.id)} className="w-full bg-transparent outline-none px-2 py-1 rounded" />
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    {item.id.startsWith("temp_") ? (
                      <button onClick={() => handleCancelUnsaved(item.id)} className="rounded px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-200">
                        Cancelar
                      </button>
                    ) : (
                      <button onClick={() => handleDelete(item.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!paginatedItems.length && (
              <tr>
                <td colSpan={2} className="px-3 py-10 text-center text-sm text-zinc-500">
                  {items.length === 0 ? "No hay categorías aún" : "No se encontraron categorías"}
                </td>
              </tr>
            )}
          </DataTable>
        </div>
      </div>}

      <TablePagination page={page} maxPage={maxPage} onChange={setPage} />
    </div>
  );
}
