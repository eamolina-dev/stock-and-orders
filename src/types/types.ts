export type Category = {
  id: string        // UUID
  name: string
}

export type Product = {
  id: string              // UUID
  name: string
  price: string           // string en UI → number en DB
  image_url: string | null
  category_id: string | null
}
