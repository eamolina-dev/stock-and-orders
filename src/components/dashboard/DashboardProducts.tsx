import DashboardLayout from "./DashboardLayout";
import ProductsTable from "./ProductsTable";

export function DashboardProducts({ user }: any) {
  return (
    <DashboardLayout>
      <ProductsTable userId={user.id} />
    </DashboardLayout>
  );
}
