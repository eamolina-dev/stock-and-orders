export type MenuItemProps = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
};

export type MenuCategoryProps = {
  id: string;
  title: string;
  items: MenuItemProps[];
};

// export const menuData: MenuCategoryProps[] = [
//   {
//     id: "pizzas",
//     title: "Pizzas",
//     items: [
//       {
//         id: "1",
//         name: "Muzzarella",
//         description: "Salsa de tomate, muzzarella y aceitunas",
//         price: "8500",
//         image: "/shahroz-khan-food-3203448_1280.jpg",
//       },
//       {
//         id: "2",
//         name: "Especial",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//       {
//         id: "3",
//         name: "Napolitana",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//       {
//         id: "4",
//         name: "Anchoas",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//       {
//         id: "5",
//         name: "Atun y cebolla",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//       {
//         id: "6",
//         name: "Rucula y jamon crudo",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//       {
//         id: "7",
//         name: "Rucula y cherry",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//       {
//         id: "8",
//         name: "Rucula y mortadela",
//         description: "Tomate, ajo, muzzarella y orégano",
//         price: "9200",
//       },
//     ],
//   },
//   {
//     id: "bebidas",
//     title: "Bebidas",
//     items: [
//       {
//         id: "coca",
//         name: "Coca Cola 1.5L",
//         price: "3500",
//       },
//     ],
//   },
// ]
