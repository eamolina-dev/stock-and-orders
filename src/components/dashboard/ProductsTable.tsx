import { useEffect, useState, useMemo } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../lib/products";
import { getCategories } from "../../lib/categories";
import type { Product, Category } from "../../types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  userId: string;
};

type ProductUI = Omit<Product, "price"> & {
  price: string;
};

export default function ProductsTable({ userId }: Props) {
  const PAGE_SIZE = 10;

  const [items, setItems] = useState<ProductUI[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<ProductUI>>>({});
  const [filter, setFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  useEffect(() => {
    load(page);
  }, [page]);

  useEffect(() => {
    getCategories({ from: 0, to: 999 }).then((res) => setCategories(res.rows));
  }, []);

  const load = async (page = 0) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { rows, count } = await getProducts({ from, to });

    const normalized: ProductUI[] = rows.map((item) => ({
      ...item,
      price: item.price === null ? "" : String(item.price),
    }));

    setItems(normalized);
    setTotal(count);
    setEdited({});
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

  const parseNumber = (value: string): number | null => {
    if (!value.trim()) return null;
    const n = Number(value.replace(",", "."));
    return isNaN(n) ? null : n;
  };

  const handleChange = (
    id: string,
    field: keyof ProductUI,
    value: string | null
  ) => {
    const safeValue = value ?? "";

    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: safeValue },
    }));

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: safeValue } : item
      )
    );
  };

  const hasChanges = Object.keys(edited).length > 0;

  const hasErrors = items.some((item) => {
    const invalidPrice = item.price !== "" && parseNumber(item.price) === null;

    return !(item.name ?? "").trim() || invalidPrice;
  });

  const highlightRows = (ids: string[]) => {
    setHighlightIds(ids);
    setTimeout(() => setHighlightIds([]), 1500);
  };

  const handleSave = async () => {
    if (hasErrors) return;

    setSaving(true);

    try {
      const affectedIds: string[] = [];

      await Promise.all(
        Object.entries(edited).map(([id, data]) => {
          affectedIds.push(id);

          if (id.startsWith("temp_")) {
            return createProduct({
              name: data.name ?? null,
              price: parseNumber((data.price as string) ?? "") ?? 0,
              image_url: data.image_url ?? null,
              category_id: data.category_id ?? null,
              user_id: userId,
            });
          }

          return updateProduct(id, {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.price !== undefined && {
              price: parseNumber(data.price),
            }),
            ...(data.image_url !== undefined && {
              image_url: data.image_url,
            }),
            ...(data.category_id !== undefined && {
              category_id: data.category_id,
            }),
          });
        })
      );

      notifySuccess("Cambios guardados");
      highlightRows(affectedIds);
      load(page);
    } catch {
      notifyError("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRow = () => {
    const tempId = `temp_${Date.now()}`;

    const newItem: ProductUI = {
      id: tempId,
      name: "",
      price: "",
      image_url: null,
      category_id: null,
    } as ProductUI;

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

      await deleteProduct(id);

      setItems((prev) => prev.filter((item) => item.id !== id));

      notifySuccess("Producto eliminado");
      highlightRows([id]);
    } catch {
      notifyError("No se pudo eliminar el producto");
    }
  };

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;

    return items.filter((item) =>
      (item.name ?? "").toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    // <div className="w-[800px] p-4 bg-gray-100">
    <div className="p-4 flex flex-col gap-4 min-w-max">
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
        + Agregar producto
      </button>

      {message && (
        <div className="bg-emerald-500 text-white px-3 py-2 rounded-md text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500 text-white px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Tabla */}
      {/* <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto"> */}
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="text-left px-3 py-2">Nombre</th>
            <th className="text-left px-3 py-2">Precio</th>
            <th className="text-left px-3 py-2">Imagen</th>
            <th className="text-left px-3 py-2">Categoría</th>
            <th className="text-left px-3 py-2 w-20"></th>
          </tr>
        </thead>

        <tbody>
          {filteredItems.map((item, i) => {
            const invalidPrice =
              item.price !== "" && parseNumber(item.price) === null;

            const isEdited = edited[item.id];

            return (
              <tr
                key={item.id}
                className={`
                    ${
                      highlightIds.includes(item.id)
                        ? "bg-emerald-100"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-zinc-50"
                    }
                    hover:bg-emerald-50
                    transition-colors
                    ${isEdited ? "ring-1 ring-amber-400" : ""}
                  `}
              >
                <td className="px-3 py-2">
                  <input
                    value={item.name || ""}
                    onChange={(e) =>
                      handleChange(item.id, "name", e.target.value)
                    }
                    className="w-full bg-transparent outline-none px-2 py-1 rounded"
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    value={item.price || ""}
                    onChange={(e) =>
                      handleChange(item.id, "price", e.target.value)
                    }
                    className={`
                        w-24 bg-transparent outline-none px-2 py-1 rounded
                        ${invalidPrice ? "ring-1 ring-red-500" : ""}
                      `}
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    value={item.image_url ?? ""}
                    onChange={(e) =>
                      handleChange(item.id, "image_url", e.target.value)
                    }
                    placeholder="URL"
                    className="w-full bg-transparent outline-none px-2 py-1 rounded"
                  />
                </td>

                <td className="px-3 py-2">
                  <select
                    value={item.category_id ?? ""}
                    onChange={(e) =>
                      handleChange(item.id, "category_id", e.target.value)
                    }
                    className="bg-transparent outline-none"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
      {/* </div>
      </div> */}

      {/* Paginación minimal integrada */}
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
