import type { MenuCategoryProps } from "./menuData";

export const tomaStore: MenuCategoryProps[] = [
  {
    id: "cervezas",
    title: "Cervezas",
    items: [
      {
        id: 1,
        name: "Corona 710ml",
        description: "Cerveza lager mexicana",
        price: 3200,
        image: "/drinks/corona.jpg",
      },
      {
        id: 2,
        name: "Heineken 473ml",
        description: "Lager premium",
        price: 2800,
        image: "/drinks/heineken.jpg",
      },
      {
        id: 3,
        name: "Budweiser 1L",
        description: "Clásica",
        price: 3100,
        image: "/drinks/bud.jpg",
      },
      {
        id: 4,
        name: "IPA Artesanal",
        description: "Lúpulo intenso",
        price: 3600,
        image: "/drinks/ipa.jpg"
      },
    ],
  },
  {
    id: "vinos",
    title: "Vinos",
    items: [
      {
        id: 5,
        name: "Malbec Reserva",
        description: "Botella 750ml",
        price: 8900,
        image: "/drinks/malbec.jpg",
      },
      {
        id: 6,
        name: "Cabernet Sauvignon",
        price: 9200,
        image: "/drinks/wine.jpg"
      },
      {
        id: 7,
        name: "Vino Blanco Dulce",
        price: 7600,
        image: "/drinks/white-wine.jpg"
      },
    ],
  },
  {
    id: "gaseosas",
    title: "Gaseosas",
    items: [
      {
        id: 8,
        name: "Coca-Cola 50ML",
        price: 4200,
        image: "/drinks/coke-bottle.jpg",
      },
      {
        id: 9,
        name: "Sprite Lata",
        price: 4100,
        image: "/drinks/sprite-lata.jpg"
      },
      {
        id: 10,
        name: "Fanta Zero Lata",
        price: 4100,
        image: "/drinks/fanta-lata.jpg"
      },
      {
        id: 11,
        name: "Coca-Cola Lata",
        price: 1800,
        image: "/drinks/coke-lata.jpg",
      },
    ],
  },
  {
    id: "energizantes",
    title: "Energizantes",
    items: [
      {
        id: 12,
        name: "Monster 250ml",
        price: 2100,
        image: "/drinks/monster.jpg",
      },
      {
        id: 13,
        name: "Red Bull 250ml",
        price: 2400,
        image: "/drinks/red-bull.jpg"
      },
    ],
  },
  {
    id: "aguas",
    title: "Aguas y Saborizadas",
    items: [
      {
        id: 14,
        name: "Agua Mineral 1.5L",
        price: 1700,
        image: "/drinks/water.jpg"
      },
      {
        id: 15,
        name: "Agua con Gas 1.5L",
        price: 1700,
        image: "/drinks/soda.jpg"
      },
      {
        id: 16,
        name: "Aquarius Pomelo",
        price: 2300,
        image: "/drinks/water_.jpg"
      },
    ],
  },
];
