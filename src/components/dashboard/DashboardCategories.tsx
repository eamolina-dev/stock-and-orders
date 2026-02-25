import DashboardLayout from "./DashboardLayout";
import CategoriesTable from "./CategoriesTable";

export function DashboardCategories({ user }: any) {
  return (
    <DashboardLayout>
      <CategoriesTable userId={user.id} />
    </DashboardLayout>
  );
}
