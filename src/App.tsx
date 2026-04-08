import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import AdminEntry from "./features/auth/components/AdminEntry";
import AdminDashboard from "./app/pages/admin/Dashboard";
import AdminLogin from "./app/pages/admin/Login";
import { ClientShopLayout } from "./app/layout/ClientShopLayout";
import ShopHome from "./features/products/pages/ShopHome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/toma" replace />} />

        <Route path="/:clientSlug" element={<ClientShopLayout />}>
          <Route index element={<ShopHome />} />
        </Route>

        <Route path="/:clientSlug/admin" element={<AdminEntry />} />
        <Route path="/:clientSlug/admin/login" element={<AdminLogin />} />

        <Route path="/:clientSlug/admin/dashboard" element={<ProtectedRoute />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="/:clientSlug/admin/shop" element={<ProtectedRoute />}>
          <Route element={<ClientShopLayout />}>
            <Route index element={<ShopHome adminMode />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
