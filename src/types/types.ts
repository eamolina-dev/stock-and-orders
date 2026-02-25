// export type Category = {
//   id: string        // UUID
//   name: string
// }

// export type Product = {
//   id: string              // UUID
//   name: string
//   price: string           // string en UI → number en DB
//   image_url: string | null
//   category_id: string | null
// }

// lib/products/types.ts
import type { Database } from './database'

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
