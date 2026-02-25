import { supabase } from "../lib/supabase"
import type { Product, ProductInsert, ProductUpdate } from "../types/types"

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name")

  if (error) throw error
  return data ?? []
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
