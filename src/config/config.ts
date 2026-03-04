import type { ThemeKey } from "../theme/themes";

export type Features = {
  cart: boolean;
  whatsappButton: boolean;
  locationButton: boolean;
  categoryFilter: boolean;
  search: boolean;
};

export type AppConfig = {
  clientId: string | null;
  theme: ThemeKey;
  clientName: string;
  description: string;
  phoneNumber: string;
  address: string;
  features: Features;
};

export const config: AppConfig = {
  clientId: import.meta.env.VITE_CLIENT_ID ?? null,
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
};
