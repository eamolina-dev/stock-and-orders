import SeedButton from "../../SeedButton";
import DashboardLayout from "./DashboardLayout";
import ProductsTable from "./ProductsTable";

export function DashboardProducts({ user }: any) {
  return (
    <DashboardLayout>
      <SeedButton />

      <ProductsTable userId={user.id} />
    </DashboardLayout>
  );
}
