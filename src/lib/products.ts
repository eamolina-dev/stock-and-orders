import { supabase } from "../lib/supabase"

type UUID = string

type CreateProduct = {
  name: string
  price: number
  image_url?: string | null
  category_id?: UUID | null
  user_id: UUID
}

type UpdateProduct = {
  id: UUID
  name?: string
  price?: number
  image?: string | null
}

type DeleteProduct = {
  id: UUID
}

export async function getProducts() {
  return await supabase
    .from("products")
    .select("*")
    .order("name")
}

export async function createProduct(data: CreateProduct) {
  return await supabase
    .from("products")
    .insert(data)
}

export async function updateProduct({ id, ...fields }: UpdateProduct) {
  return await supabase
    .from("products")
    .update(fields)
    .eq("id", id)
}

export async function deleteProduct({ id }: DeleteProduct) {
  return await supabase
    .from("products")
    .delete()
    .eq("id", id)
}
