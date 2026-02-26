import { supabase } from "./supabase";
import type { Category, CategoryInsert, CategoryUpdate } from "../types/types";

type Props = {
  from: number;
  to: number;
};

type GetCategoryResult = {
  rows: Category[]
  count: number
}

export async function getCategories({ from, to }: Props): Promise<GetCategoryResult> {
  const { data, error, count } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("name");

  if (error) throw error;

  return {
    rows: data ?? [],
    count: count ?? 0,
  };
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
