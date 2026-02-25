import { useParams, Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ProductsTable from "../components/dashboard/ProductsTable";
import CategoriesTable from "../components/dashboard/CategoriesTable";

type Props = {
  userId: string;
};

export const Dashboard = ({ userId }: Props) => {
  const { tab } = useParams();

  if (tab !== "products" && tab !== "categories") {
    return <Navigate to="/dashboard/products" replace />;
  }

  return (
    <DashboardLayout>
      {tab === "products" && <ProductsTable userId={userId} />}
      {tab === "categories" && <CategoriesTable userId={userId} />}
    </DashboardLayout>
  );
};
