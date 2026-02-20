import { ShopItemCard } from "./ShopItemCard";
import type { MenuCategoryProps as MenuCategoryType } from "../../data/menuData";

type Props = {
  category: MenuCategoryType;
  showAddButton?: boolean;
};

export const ShopCategory = ({ category, showAddButton }: Props) => {
  return (
    <section id={category.id} className="mb-12">
      <h2 className="category accent text-2xl font-medium mb-6 border-b pb-2 text-center">
        {category.title}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {category.items.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            showAddButton={showAddButton}
          />
        ))}
      </div>
    </section>
  );
};
