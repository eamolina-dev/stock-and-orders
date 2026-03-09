import type { Product, ProductInsert, ProductUpdate } from "../../shared/types/entities";

export type Item = Product;
export type ItemInsert = ProductInsert;
export type ItemUpdate = ProductUpdate;

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};
