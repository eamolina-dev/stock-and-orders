import { supabase } from "./supabase"
import type { Category, CategoryInsert, CategoryUpdate } from "../types/types"

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) throw error
  return data ?? []
}

export async function createCategory(input: CategoryInsert): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .insert(input)

  if (error) throw error
}

export async function updateCategory(
  id: string,
  changes: CategoryUpdate
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update(changes)
    .eq("id", id)

  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) throw error
}
