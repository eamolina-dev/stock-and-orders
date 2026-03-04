import type { User } from "@supabase/supabase-js";
import DashboardLayout from "./DashboardLayout";
import CategoriesTable from "./CategoriesTable";

type Props = {
  user: User | null;
};

export function DashboardCategories({ user }: Props) {
  if (!user) return null;

  return (
    <DashboardLayout>
      <CategoriesTable userId={user.id} />
    </DashboardLayout>
  );
}
