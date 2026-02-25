import { useEffect, useState, useMemo } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../lib/products";
import { getCategories } from "../../lib/categories";
import type { Product, Category } from "../../types/types";

type UUID = string;

type Props = {
  userId: UUID;
};

export default function ProductsTable({ userId }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<Product>>>({});
  const [filter, setFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    load();
    getCategories().then((res) => setCategories(res.data ?? []));
  }, []);

  const load = async () => {
    const res = await getProducts();

    const normalized =
      res.data?.map((item) => ({
        ...item,
        price:
          item.price === null || item.price === undefined
            ? ""
            : String(item.price),
      })) ?? [];

    setItems(normalized);
    setEdited({});
  };

  const handleChange = (id: UUID, field: keyof Product, value: any) => {
    const safeValue = field === "price" ? String(value) : value;

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

  const parseNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const n = Number(value.replace(",", "."));
    return isNaN(n) ? undefined : n;
  };

  const hasChanges = Object.keys(edited).length > 0;

  const hasErrors = items.some((item) => {
    const invalidPrice =
      item.price !== "" && parseNumber(item.price) === undefined;

    return !item.name?.trim() || invalidPrice;
  });

  const handleSave = async () => {
    if (hasErrors) return;

    await Promise.all(
      Object.entries(edited).map(([id, data]) => {
        if (id.startsWith("temp_")) {
          return createProduct({
            name: data.name ?? "",
            price: parseNumber(data.price ?? "") ?? 0,
            image_url: data.image_url ?? null,
            category_id: data.category_id ?? null,
            user_id: userId,
          });
        }

        return updateProduct({
          id,
          ...(data.name !== undefined && { name: data.name }),
          ...(data.price !== undefined && {
            price: parseNumber(data.price) ?? 0,
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

    load();
  };

  const handleAddRow = () => {
    const tempId = `temp_${Date.now()}`;

    const newItem: Product = {
      id: tempId,
      name: "",
      price: "",
      image_url: null,
      category_id: null,
    };

    setItems((prev) => [newItem, ...prev]);
    setEdited((prev) => ({ ...prev, [tempId]: newItem }));
  };

  const handleDelete = async (id: UUID) => {
    if (id.startsWith("temp_")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setEdited((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    await deleteProduct({ id });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase())
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
        + Agregar producto
      </button>

      {/* Tabla */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
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
                  item.price !== "" && parseNumber(item.price) === undefined;

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
                        value={item.name}
                        onChange={(e) =>
                          handleChange(item.id, "name", e.target.value)
                        }
                        className="w-full bg-transparent outline-none px-2 py-1 rounded"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        value={item.price}
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
                          handleChange(
                            item.id,
                            "category_id",
                            e.target.value || null
                          )
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
        </div>
      </div>
    </div>
  );
}
