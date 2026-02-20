// data/index.ts
// import { laPalmera } from "./laPalmera";
// import { ricardo } from "./ricardo";
// import { demoBistroMenu } from "./bitroMenu";
import { tomaStore } from "./tomaStore";

export const menus = {
  // laPalmera: laPalmera,
  // ricardo: ricardo,
  // bistro: demoBistroMenu,
  toma: tomaStore,
};

export type MenuKey = keyof typeof menus;
