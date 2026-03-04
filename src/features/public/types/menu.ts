export type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};
