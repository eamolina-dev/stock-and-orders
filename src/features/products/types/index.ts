import type { Product, ProductInsert, ProductUpdate } from "../../../shared/types/entities";

export type Item = Product;
export type ItemInsert = ProductInsert;
export type ItemUpdate = ProductUpdate;

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export type ShopCategory = {
  id: string;
  title: string;
  items: ShopItem[];
  isDefault?: boolean;
  displayOrder?: number;
};
