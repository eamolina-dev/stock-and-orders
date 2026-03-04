import type { ThemeKey } from "../theme/themes";

export type Features = {
  cart: boolean;
  whatsappButton: boolean;
  locationButton: boolean;
  categoryFilter: boolean;
  search: boolean;
};

export type AppConfig = {
  theme: ThemeKey;
  clientName: string;
  description: string;
  phoneNumber: string;
  address: string;
  features: Features;
};
