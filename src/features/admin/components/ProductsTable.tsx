import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../shared/tables/DataTable";
import { TablePagination } from "../../../shared/tables/TablePagination";
import { InlineAlert } from "../../../shared/ui/InlineAlert";
import { getCategories } from "../../../modules/categories/queries";
import { createItem, deleteItem, getItems, updateItem } from "../../../modules/items/queries";
import type { CategoryEntity } from "../../../modules/categories/types";
import type { Item } from "../../../modules/items/types";

type Props = { clientId: string };

type ItemUI = Omit<Item, "price"> & { price: string };

const PAGE_SIZE = 10;

export default function ProductsTable({ clientId }: Props) {
  const [items, setItems] = useState<ItemUI[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<ItemUI>>>({});
  const [filter, setFilter] = useState("");
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  const load = useCallback(async (nextPage = 0) => {
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { rows, count } = await getItems(clientId, { from, to });
    setItems(
      rows.map((item) => ({
        ...item,
        price: item.price === null ? "" : String(item.price),
      }))
    );
    setTotal(count);
    setEdited({});
  }, [clientId]);

  useEffect(() => {
    load(page);
  }, [page, load]);

  useEffect(() => {
    getCategories(clientId, { from: 0, to: 999 }).then((res) => setCategories(res.rows));
  }, [clientId]);

  const parseNumber = (value: string): number | null => {
    if (!value.trim()) return null;
    const n = Number(value.replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };

  const notifySuccess = (text: string) => {
    setError(null);
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  };

  const notifyError = (text: string) => {
    setMessage(null);
    setError(text);
    setTimeout(() => setError(null), 3500);
  };

  const handleChange = (id: string, field: keyof ItemUI, value: string | null) => {
    const safeValue = value ?? "";

    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], [field]: safeValue } }));
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: safeValue } : item)));
  };

  const hasChanges = Object.keys(edited).length > 0;
  const hasErrors = items.some((item) => !(item.name ?? "").trim() || (item.price !== "" && parseNumber(item.price) === null));

  const handleSave = async () => {
    if (hasErrors) return;

    setSaving(true);
    try {
      const affectedIds: string[] = [];

      await Promise.all(
        Object.entries(edited).map(([id, data]) => {
          affectedIds.push(id);
          if (id.startsWith("temp_")) {
            return createItem({
              name: data.name ?? null,
              price: parseNumber((data.price as string) ?? "") ?? 0,
              image_url: data.image_url ?? null,
              category_id: data.category_id ?? null,
              client_id: clientId,
            });
          }

          return updateItem(id, {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.price !== undefined && { price: parseNumber(data.price) }),
            ...(data.image_url !== undefined && { image_url: data.image_url }),
            ...(data.category_id !== undefined && { category_id: data.category_id }),
          });
        })
      );

      notifySuccess("Cambios guardados");
      setHighlightIds(affectedIds);
      setTimeout(() => setHighlightIds([]), 1500);
      load(page);
    } catch {
      notifyError("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRow = () => {
    const tempId = `temp_${Date.now()}`;
    const newItem = { id: tempId, name: "", price: "", image_url: null, category_id: null } as ItemUI;

    setItems((prev) => [newItem, ...prev]);
    setEdited((prev) => ({ ...prev, [tempId]: newItem }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar producto?")) return;

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

      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      notifySuccess("Producto eliminado");
    } catch {
      notifyError("No se pudo eliminar el producto");
    }
  };

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;
    return items.filter((item) => (item.name ?? "").toLowerCase().includes(filter.toLowerCase()));
  }, [items, filter]);

  return (
    <div className="p-4 flex flex-col gap-4 min-w-max">
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
        + Agregar producto
      </button>

      {message && <InlineAlert tone="success" message={message} />}
      {error && <InlineAlert tone="error" message={error} />}

      <DataTable
        minWidthClassName="min-w-full"
        columns={
          <>
            <th className="text-left px-3 py-2">Nombre</th>
            <th className="text-left px-3 py-2">Precio</th>
            <th className="text-left px-3 py-2">Imagen</th>
            <th className="text-left px-3 py-2">Categoría</th>
            <th className="text-left px-3 py-2 w-20"></th>
          </>
        }
      >
        {filteredItems.map((item, i) => {
          const invalidPrice = item.price !== "" && parseNumber(item.price) === null;
          const isEdited = edited[item.id];

          return (
            <tr
              key={item.id}
              className={`${highlightIds.includes(item.id) ? "bg-emerald-100" : i % 2 === 0 ? "bg-white" : "bg-zinc-50"} hover:bg-emerald-50 transition-colors ${isEdited ? "ring-1 ring-amber-400" : ""}`}
            >
              <td className="px-3 py-2">
                <input value={item.name || ""} onChange={(e) => handleChange(item.id, "name", e.target.value)} className="w-full bg-transparent outline-none px-2 py-1 rounded" />
              </td>
              <td className="px-3 py-2">
                <input
                  value={item.price || ""}
                  onChange={(e) => handleChange(item.id, "price", e.target.value)}
                  className={`w-24 bg-transparent outline-none px-2 py-1 rounded ${invalidPrice ? "ring-1 ring-red-500" : ""}`}
                />
              </td>
              <td className="px-3 py-2">
                <input value={item.image_url ?? ""} onChange={(e) => handleChange(item.id, "image_url", e.target.value)} placeholder="URL" className="w-full bg-transparent outline-none px-2 py-1 rounded" />
              </td>
              <td className="px-3 py-2">
                <select value={item.category_id ?? ""} onChange={(e) => handleChange(item.id, "category_id", e.target.value)} className="bg-transparent outline-none">
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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

      <TablePagination page={page} maxPage={maxPage} onChange={setPage} />
    </div>
  );
}
