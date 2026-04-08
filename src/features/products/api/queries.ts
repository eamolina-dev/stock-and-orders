import { supabase } from "../../../shared/lib/supabase";
import type { ShopCategory, Item, ItemInsert, ItemUpdate } from "../types";

type RangeInput = { from: number; to: number };

type GetItemsResult = {
  rows: Item[];
  count: number;
};

const resolveProductImage = (imagePath: string | null): string | undefined => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const { data } = supabase.storage.from("toma-images").getPublicUrl(imagePath);
  return data.publicUrl;
};

export async function getItems(clientId: string, { from, to }: RangeInput): Promise<GetItemsResult> {
  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("client_id", clientId)
    .range(from, to)
    .order("name");

  if (error) {
    console.error("Supabase query error", error);
    throw error;
  }

  return { rows: data ?? [], count: count ?? 0 };
}

export async function createItem(input: ItemInsert): Promise<void> {
  const { error } = await supabase.from("products").insert(input);
  if (error) {
    console.error("Supabase query error", error);
    throw error;
  }
}

export async function updateItem(id: string, changes: ItemUpdate): Promise<void> {
  const { error } = await supabase.from("products").update(changes).eq("id", id);
  if (error) {
    console.error("Supabase query error", error);
    throw error;
  }
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Supabase query error", error);
    throw error;
  }
}

export async function getPublicMenu(clientId: string): Promise<ShopCategory[]> {
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name").eq("client_id", clientId).order("name"),
      supabase
        .from("products")
        .select("id, name, price, image_url, category_id")
        .eq("client_id", clientId)
        .order("name"),
    ]);

  if (categoriesError || productsError) {
    console.error("Supabase query error", categoriesError ?? productsError);
    throw categoriesError ?? productsError;
  }

  const productsByCategory = new Map<string, ShopCategory["items"]>();

  for (const product of products ?? []) {
    if (!product.category_id || !product.name || typeof product.price !== "number") continue;

    const categoryItems = productsByCategory.get(product.category_id) ?? [];
    categoryItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: resolveProductImage(product.image_url),
    });
    productsByCategory.set(product.category_id, categoryItems);
  }

  return (categories ?? [])
    .map((category) => ({
      id: category.id,
      title: category.name ?? "Sin nombre",
      items: productsByCategory.get(category.id) ?? [],
    }))
    .filter((category) => category.items.length > 0);
}
