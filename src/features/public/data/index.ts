import { tomaStore } from "./tomaStore";

export const menus = {
  toma: tomaStore,
};

export type MenuKey = keyof typeof menus;
