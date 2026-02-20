import type { MenuKey } from "../data";
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


// export const config: {
//   clientId: MenuKey;
//   theme: ThemeKey;
//   clientName: string;
//   description: string;
//   phoneNumber: string;
//   address: string;
//   menu: string;
//   features: Features;
// } = {
//   clientId: 'bistro',
//   theme: "dark",
//   clientName: 'Bistro Central',
//   description: 'Cocina casera con un toque moderno',
//   phoneNumber: '5493584382061',
//   address: 'Capitan Alejo Zalazar 169, Reduccion, Cordoba, Argentina',
//   menu: 'bistro',

//   features: {
//     cart: true,
//     whatsappButton: true,
//     locationButton: true,
//     categoryFilter: true,
//     search: true,
//   },
// };
