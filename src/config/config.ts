import type { MenuKey } from "../features/public/data";
import type { ThemeKey } from "../theme/themes";

export type Features = {
  cart: boolean;
  whatsappButton: boolean;
  locationButton: boolean;
  categoryFilter: boolean;
  search: boolean;
};

export type AppConfig = {
  clientId: MenuKey;
  theme: ThemeKey;
  clientName: string;
  description: string;
  phoneNumber: string;
  address: string;
  features: Features;
};
