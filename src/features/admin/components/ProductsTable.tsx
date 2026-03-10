import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { optimizeImage } from "../../../utils/optimizeImage";
import { DataTable } from "../../../shared/tables/DataTable";
import { TablePagination } from "../../../shared/tables/TablePagination";
import { InlineAlert } from "../../../shared/ui/InlineAlert";
import { getCategories } from "../../../modules/categories/queries";
import {
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "../../../modules/items/queries";
import type { CategoryEntity } from "../../../modules/categories/types";
import type { Item } from "../../../modules/items/types";
import { supabase } from "../../../lib/supabase";

type Props = { clientId: string };

type ItemUI = Omit<Item, "price"> & { price: string };

const PAGE_SIZE = 10;

export default function ProductsTable({ clientId }: Props) {
  const [items, setItems] = useState<ItemUI[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<ItemUI>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);
  const [imageAvailability, setImageAvailability] = useState<
    Record<string, boolean>
  >({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  const load = useCallback(
    async (nextPage = 0) => {
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
    },
    [clientId]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  useEffect(() => {
    getCategories(clientId, { from: 0, to: 999 }).then((res) =>
      setCategories(res.rows)
    );
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

  const handleChange = (
    id: string,
    field: keyof ItemUI,
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
  const hasErrors = items.some(
    (item) =>
      !(item.name ?? "").trim() ||
      (item.price !== "" && parseNumber(item.price) === null)
  );

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
            ...(data.category_id !== undefined && {
              category_id: data.category_id,
            }),
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
    const newItem = {
      id: tempId,
      name: "",
      price: "",
      image_url: null,
      category_id: null,
    } as ItemUI;

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

  const getExtensionFromFile = (file: File): string | null => {
    const mimeMap: Record<string, string> = {
      "image/jpeg": "jpeg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
      "image/avif": "avif",
      "image/bmp": "bmp",
      "image/tiff": "tiff",
      "image/x-icon": "ico",
    };

    if (file.type && mimeMap[file.type]) return mimeMap[file.type];

    const splitName = file.name.split(".");
    const byName = splitName.length > 1 ? splitName.pop()?.toLowerCase() : null;
    return byName || null;
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleUploadImage = async (item: ItemUI, file: File) => {
    if (file && file.size > 10 * 1024 * 1024) {
      notifyError("La imagen no puede superar los 10MB");
      return;
    }

    const slug = slugify(item.name ?? "");
    if (!slug) {
      notifyError("El producto debe tener nombre para generar el archivo");
      return;
    }

    setUploadingIds((prev) => [...prev, item.id]);
    try {
      const optimizedFile = await optimizeImage(file);

      const extension =
        getExtensionFromFile(optimizedFile) || getExtensionFromFile(file);
      if (!extension) {
        notifyError("No se pudo detectar la extensión del archivo");
        return;
      }

      const fileName = `${slug}.${extension}`;
      const filePath = `new-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("toma-images")
        .upload(filePath, optimizedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("toma-images")
        .getPublicUrl(filePath);
      const imageUrl = data.publicUrl;

      await updateItem(item.id, { image_url: imageUrl });

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, image_url: imageUrl } : row
        )
      );
      setEdited((prev) => {
        const copy = { ...prev };
        if (copy[item.id]) {
          copy[item.id] = { ...copy[item.id], image_url: imageUrl };
        }
        return copy;
      });
      setImageAvailability((prev) => ({ ...prev, [item.id]: true }));
      notifySuccess("Imagen subida y producto actualizado");
    } catch {
      notifyError("No se pudo subir la imagen");
    } finally {
      setUploadingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  useEffect(() => {
    let active = true;

    const verifyImageUrls = async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          const imageUrl = item.image_url?.trim();
          if (!imageUrl) return [item.id, false] as const;

          try {
            const response = await fetch(imageUrl, { method: "HEAD" });
            return [item.id, response.ok] as const;
          } catch {
            return [item.id, false] as const;
          }
        })
      );

      if (!active) return;
      setImageAvailability(Object.fromEntries(entries));
    };

    verifyImageUrls();

    return () => {
      active = false;
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return items.filter((item) =>
      (item.name ?? "").toLowerCase().includes(normalizedSearchTerm)
    );
  }, [items, searchTerm]);

  return (
    <div className="p-4 flex flex-col gap-4 min-w-max">
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
            hasChanges && !hasErrors
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
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
          const invalidPrice =
            item.price !== "" && parseNumber(item.price) === null;
          const isEdited = edited[item.id];

          return (
            <tr
              key={item.id}
              className={`${
                highlightIds.includes(item.id)
                  ? "bg-emerald-100"
                  : i % 2 === 0
                  ? "bg-white"
                  : "bg-zinc-50"
              } hover:bg-emerald-50 transition-colors ${
                isEdited ? "ring-1 ring-amber-400" : ""
              }`}
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
                  className={`w-24 bg-transparent outline-none px-2 py-1 rounded ${
                    invalidPrice ? "ring-1 ring-red-500" : ""
                  }`}
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-col gap-2">
                  {/* <input value={item.image_url ?? ""} onChange={(e) => handleChange(item.id, "image_url", e.target.value)} placeholder="URL" className="w-full bg-transparent outline-none px-2 py-1 rounded" /> */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={(node) => {
                        fileInputRefs.current[item.id] = node;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleUploadImage(item, file);
                        }
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={
                        item.id.startsWith("temp_") ||
                        uploadingIds.includes(item.id)
                      }
                      onClick={() => fileInputRefs.current[item.id]?.click()}
                      className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-300 disabled:text-zinc-500"
                    >
                      {uploadingIds.includes(item.id)
                        ? "Subiendo..."
                        : "Subir imagen"}
                    </button>

                    {imageAvailability[item.id] && item.image_url && (
                      <a
                        href={item.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      >
                        Ver imagen
                      </a>
                    )}
                  </div>
                </div>
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
      </DataTable>

      <TablePagination page={page} maxPage={maxPage} onChange={setPage} />
    </div>
  );
}
