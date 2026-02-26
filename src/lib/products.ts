import { supabase } from "../lib/supabase"
import type { Product, ProductInsert, ProductUpdate } from "../types/types"

type Props = {
  from: number,
  to: number
}

type GetProductsResult = {
  rows: Product[]
  count: number
}

export async function getProducts({ from, to }: Props): Promise<GetProductsResult> {
  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("name");

  if (error) throw error;

  return {
    rows: data ?? [],
    count: count ?? 0,
  };
}

export async function createProduct(input: ProductInsert): Promise<void> {
  const { error } = await supabase
    .from("products")
    .insert(input)

  if (error) throw error
}

export async function updateProduct(
  id: string,
  changes: ProductUpdate
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update(changes)
    .eq("id", id)

  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) throw error
}
