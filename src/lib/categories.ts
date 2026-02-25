import { supabase } from "../lib/supabase"

type UUID = string

type CreateType = {
  name: string
  user_id: UUID
}

type UpdateType = {
  id: UUID
  name: string
}

type DeleteType = {
  id: UUID
}

export async function getCategories() {
  return await supabase
    .from("categories")
    .select("*")
    .order("name")
}

export async function createCategory({ name, user_id }: CreateType) {
  return await supabase
    .from("categories")
    .insert({ name, user_id })
}

export async function updateCategory({ id, name }: UpdateType) {
  return await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
}

export async function deleteCategory({ id }: DeleteType) {
  return await supabase
    .from("categories")
    .delete()
    .eq("id", id)
}
