import type { AppConfig } from "./config";

export const clients: Record<string, AppConfig> = {
  toma: {
    theme: "dark",
    clientName: "toma.",
    description: "Casa de bebidas",
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
};
