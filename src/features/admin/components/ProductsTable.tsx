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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [imageAvailability, setImageAvailability] = useState<
    Record<string, boolean>
  >({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});


  const load = useCallback(
    async () => {
      setLoadingItems(true);
      try {
        const { rows } = await getItems(clientId, { from: 0, to: 9999 });
        const mappedRows = rows.map((item) => ({
          ...item,
          price: item.price === null ? "" : String(item.price),
        }));
        setItems(mappedRows);
        setEdited({});
        return mappedRows;
      } catch (loadError) {
        console.error("Error loading products", loadError);
        setItems([]);
        notifyError("Error al cargar los datos");
        return [];
      } finally {
        setLoadingItems(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      setLoadingCategories(true);

      try {
        const res = await getCategories(clientId, { from: 0, to: 999 });
        if (!active) return;
        setCategories(res.rows ?? []);
      } catch (categoriesError) {
        console.error("Error loading categories", categoriesError);
        if (!active) return;
        setCategories([]);
        notifyError("Error al cargar los datos");
      } finally {
        if (active) setLoadingCategories(false);
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, [clientId]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, categoryFilter]);

  const parseNumber = (value: string): number | null => {
    if (!value.trim()) return null;
    const n = Number(value.replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

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


  const handlePriceChange = (id: string, value: string) => {
    handleChange(id, "price", value);
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
      const createdNames: string[] = [];

      await Promise.all(
        Object.entries(edited).map(([id, data]) => {
          affectedIds.push(id);
          if (id.startsWith("temp_")) {
            if (data.name?.trim()) {
              createdNames.push(data.name.trim());
            }
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

      const reloadedItems = await load();
      if (createdNames.length) {
        notifySuccess("Producto creado");
        const normalizedCreated = createdNames.map((name) => normalizeText(name));
        const createdIds = reloadedItems
          .filter((item) => normalizedCreated.includes(normalizeText(item.name ?? "")))
          .map((item) => item.id);
        setHighlightIds(createdIds);
        setTimeout(() => setHighlightIds([]), 2000);
      } else {
        notifySuccess("Cambios guardados");
        setHighlightIds(affectedIds);
        setTimeout(() => setHighlightIds([]), 1500);
      }
    } catch (saveError) {
      console.error("Error saving products", saveError);
      notifyError("Error al cargar los datos");
    } finally {
      setSaving(false);
    }
  };

  const focusRow = (id: string) => {
    const targetRow = rowRefs.current[id];
    if (!targetRow) return;

    targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstInput = targetRow.querySelector("input, select") as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    firstInput?.focus();
  };

  const handleAddRow = () => {
    setSearchTerm("");
    setCategoryFilter(null);
    setPage(0);

    const existingUnsaved = items.find((item) => item.id.startsWith("temp_"));
    if (existingUnsaved) {
      focusRow(existingUnsaved.id);
      notifyError("Ya existe un producto sin guardar");
      return;
    }

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

    setTimeout(() => focusRow(tempId), 0);
  };

  const handleCancelUnsaved = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setEdited((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que querés eliminar este producto?")) return;

    try {
      if (id.startsWith("temp_")) {
        handleCancelUnsaved(id);
        return;
      }

      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      notifySuccess("Producto eliminado");
    } catch (deleteError) {
      console.error("Error deleting product", deleteError);
      notifyError("Error al cargar los datos");
    }
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

    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const slug = slugify(originalName) || "imagen";

    setUploadingIds((prev) => [...prev, item.id]);
    setUploadErrors((prev) => ({ ...prev, [item.id]: "" }));
    try {
      const optimizedFile = await optimizeImage(file);

      const randomId = Math.random().toString(36).slice(2, 6);
      const fileName = `${slug}-${randomId}.webp`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("toma-images")
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      if (!item.id.startsWith("temp_")) {
        await updateItem(item.id, { image_url: filePath });
      }

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, image_url: filePath } : row
        )
      );
      setEdited((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], image_url: filePath },
      }));
      setImageAvailability((prev) => ({ ...prev, [item.id]: true }));
      notifySuccess("Imagen subida y producto actualizado");
    } catch (uploadError) {
      console.error("Error uploading product image", uploadError);
      setUploadErrors((prev) => ({
        ...prev,
        [item.id]: "No se pudo subir la imagen. Intenta nuevamente.",
      }));
      notifyError("No se pudo subir la imagen. Intenta nuevamente.");
    } finally {
      setUploadingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };


  const getPublicImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const { data } = supabase.storage.from("toma-images").getPublicUrl(imagePath);
    return data.publicUrl;
  };

  useEffect(() => {
    let active = true;

    const verifyImageUrls = async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          const imageUrl = getPublicImageUrl(item.image_url?.trim());
          if (!imageUrl) return [item.id, false] as const;

          try {
            const response = await fetch(imageUrl, { method: "HEAD" });
            return [item.id, response.ok] as const;
          } catch (imageError) {
            console.error("Error validating image url", imageError);
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
    const searchWords = normalizeText(searchTerm)
      .split(/\s+/)
      .filter(Boolean);

    return items.filter((item) => {
      const normalizedName = normalizeText(item.name ?? "");
      const matchesSearch = searchWords.every((word) =>
        normalizedName.includes(word)
      );
      const matchesCategory =
        !categoryFilter || item.category_id === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, categoryFilter]);

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
    <div className="p-4 flex flex-col gap-4 min-w-max">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="products-search" className="sr-only">
            Buscar producto
          </label>
          <input
            id="products-search"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <label htmlFor="products-category-filter" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="products-category-filter"
            value={categoryFilter ?? ""}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-3 py-2 text-sm rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={loadingCategories}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          disabled={saving || !hasChanges || hasErrors}
          onClick={handleSave}
          className={`px-4 py-2 text-sm rounded-md transition ${
            hasChanges && !hasErrors
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          Guardar
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

      <p className="text-sm text-zinc-500">
        Mostrando {filteredItems.length} de {items.length} productos
      </p>

      {(searchTerm.trim() || categoryFilter) && (
        <p className="text-xs text-zinc-500">
          Filtros activos: {categoryFilter
            ? `categoría ${
                categories.find((category) => category.id === categoryFilter)
                  ?.name ?? "seleccionada"
              }`
            : "todas las categorías"}
          {searchTerm.trim() ? ` + búsqueda "${searchTerm.trim()}"` : ""}
        </p>
      )}

      {loadingItems && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
          Cargando productos...
        </div>
      )}

      {!loadingItems && (
        <DataTable
          minWidthClassName="min-w-full"
          columns={
            <>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Precio</th>
              <th className="text-left px-3 py-2">Imagen</th>
              <th className="text-left px-3 py-2">Categoría</th>
              <th className="text-left px-3 py-2 w-24">Acciones</th>
            </>
          }
        >
          {paginatedItems.map((item, i) => {
          const invalidPrice =
            item.price !== "" && parseNumber(item.price) === null;
          const isEdited = edited[item.id];

          return (
            <tr
              key={item.id}
              ref={(node) => {
                rowRefs.current[item.id] = node;
              }}
              className={`${
                highlightIds.includes(item.id)
                  ? "bg-emerald-100"
                  : item.id.startsWith("temp_")
                  ? "bg-amber-50"
                  : i % 2 === 0
                  ? "bg-zinc-50"
                  : "bg-zinc-100"
              } hover:bg-emerald-50 transition-colors ${
                isEdited || item.id.startsWith("temp_") ? "ring-1 ring-amber-400" : ""
              }`}
            >
              <td className="px-3 py-2">
                {item.id.startsWith("temp_") && (
                  <span className="mb-1 inline-block rounded bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    Nuevo
                  </span>
                )}
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
                  type="number"
                  value={item.price ?? ""}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  className={`w-28 bg-transparent outline-none px-2 py-1 rounded ${
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
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
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
                      disabled={saving || uploadingIds.includes(item.id)}
                      onClick={() => fileInputRefs.current[item.id]?.click()}
                      className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-300 disabled:text-zinc-500"
                    >
                      {uploadingIds.includes(item.id)
                        ? "Subiendo imagen..."
                        : "Subir imagen"}
                    </button>

                    {imageAvailability[item.id] && item.image_url && (
                      <a
                        href={getPublicImageUrl(item.image_url) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      >
                        Ver imagen
                      </a>
                    )}
                  </div>
                  {uploadErrors[item.id] && (
                    <p className="text-xs text-red-500">{uploadErrors[item.id]}</p>
                  )}
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
                {item.id.startsWith("temp_") ? (
                  <button
                    onClick={() => handleCancelUnsaved(item.id)}
                    className="rounded px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          );
          })}
          {!paginatedItems.length && (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-sm text-zinc-500">
                {items.length === 0
                  ? "No hay productos aún"
                  : "No se encontraron productos"}
              </td>
            </tr>
          )}
        </DataTable>
      )}

      <TablePagination page={page} maxPage={maxPage} onChange={setPage} />
    </div>
  );
}
