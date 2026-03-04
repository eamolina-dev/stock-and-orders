import type { User } from "@supabase/supabase-js";
import SeedButton from "../../SeedButton";
import DashboardLayout from "./DashboardLayout";
import ProductsTable from "./ProductsTable";

type Props = {
  user: User | null;
};

export function DashboardProducts({ user }: Props) {
  if (!user) return null;

  return (
    <DashboardLayout>
      <SeedButton />

      <ProductsTable userId={user.id} />
    </DashboardLayout>
  );
}
