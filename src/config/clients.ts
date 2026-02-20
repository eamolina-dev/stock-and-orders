import type { AppConfig } from "./config";

export const clients: Record<string, AppConfig> = {
  demo: {
    clientId: "bistro",
    theme: "dark",
    clientName: "Bistro Central",
    description: "Cocina casera con un toque moderno",
    phoneNumber: "5493584382061",
    address: "Capitan Alejo Zalazar 169, Reducción, Córdoba, Argentina",
    features: {
      cart: false,
      whatsappButton: true,
      locationButton: true,
      categoryFilter: true,
      search: true,
    },
  },

  toma: {
    clientId: "toma",
    theme: "dark",
    clientName: "toma.",
    description: "Casa de bebidas",
    // phoneNumber: "543585701130",
    phoneNumber: "5493584382061",
    address: "https://maps.app.goo.gl/VfTYyicg2geiwudf9",
    features: {
      cart: true,
      whatsappButton: false,
      locationButton: true,
      categoryFilter: true,
      search: true,
    },
  },

  simpleCafe: {
    clientId: "bistro",
    theme: "light",
    clientName: "Café del Parque",
    description: "Café de especialidad y pastelería",
    phoneNumber: "5491112345678",
    address: "Buenos Aires, Argentina",
    features: {
      cart: false,
      whatsappButton: true,
      locationButton: true,
      categoryFilter: false,
      search: false,
    },
  },

  pizzeriaPro: {
    clientId: "bistro",
    theme: "bold",
    clientName: "Pizzería Don Luigi",
    description: "Pizza a la piedra desde 1987",
    phoneNumber: "5491122223333",
    address: "Rosario, Santa Fe, Argentina",
    features: {
      cart: true,
      whatsappButton: true,
      locationButton: true,
      categoryFilter: true,
      search: true,
    },
  },
};
