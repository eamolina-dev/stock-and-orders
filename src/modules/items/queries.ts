import { supabase } from "../../lib/supabase";
import type { MenuCategory, Item, ItemInsert, ItemUpdate } from "./types";

type RangeInput = { from: number; to: number };

type GetItemsResult = {
  rows: Item[];
  count: number;
};

export async function getItems({ from, to }: RangeInput): Promise<GetItemsResult> {
  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("name");

  if (error) throw error;

  return { rows: data ?? [], count: count ?? 0 };
}

export async function createItem(input: ItemInsert): Promise<void> {
  const { error } = await supabase.from("products").insert(input);
  if (error) throw error;
}

export async function updateItem(id: string, changes: ItemUpdate): Promise<void> {
  const { error } = await supabase.from("products").update(changes).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function getPublicMenu(): Promise<MenuCategory[]> {
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("products").select("id, name, price, image_url, category_id").order("name"),
    ]);

  if (categoriesError || productsError) {
    throw categoriesError ?? productsError;
  }

  const productsByCategory = new Map<string, MenuCategory["items"]>();

  for (const product of products ?? []) {
    if (!product.category_id || !product.name || typeof product.price !== "number") continue;

    const categoryItems = productsByCategory.get(product.category_id) ?? [];
    categoryItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url ?? undefined,
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
