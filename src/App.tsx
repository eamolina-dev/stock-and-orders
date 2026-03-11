import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./features/admin/components/ProtectedRoute";
import AdminEntry from "./features/admin/components/AdminEntry";
import AdminDashboard from "./features/admin/pages/Dashboard";
import AdminLogin from "./features/admin/pages/Login";
import { ClientShopLayout } from "./features/shop/layouts/ClientShopLayout";
import ShopHome from "./features/shop/pages/ShopHome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/toma/shop" replace />} />

        <Route path="/:clientSlug/shop" element={<ClientShopLayout />}>
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
