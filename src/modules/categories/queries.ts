import { supabase } from "../../lib/supabase";
import type {
  CategoryEntity,
  CategoryInsertInput,
  CategoryUpdateInput,
} from "./types";

type RangeInput = { from: number; to: number };

type GetCategoriesResult = {
  rows: CategoryEntity[];
  count: number;
};

export async function getCategories({ from, to }: RangeInput): Promise<GetCategoriesResult> {
  const { data, error, count } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("name");

  if (error) throw error;

  return { rows: data ?? [], count: count ?? 0 };
}

export async function createCategory(input: CategoryInsertInput): Promise<void> {
  const { error } = await supabase.from("categories").insert(input);
  if (error) throw error;
}

export async function updateCategory(id: string, changes: CategoryUpdateInput): Promise<void> {
  const { error } = await supabase.from("categories").update(changes).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
