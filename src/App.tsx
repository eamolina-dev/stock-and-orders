import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./features/admin/components/ProtectedRoute";
import { Home } from "./shared/pages/Home";
import AdminDashboard from "./features/admin/pages/Dashboard";
import AdminLogin from "./features/admin/pages/Login";
import { ClientShopLayout } from "./features/shop/layouts/ClientShopLayout";
import ShopHome from "./features/shop/pages/ShopHome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/:clientSlug/shop" element={<ClientShopLayout />}>
          <Route index element={<ShopHome />} />
        </Route>

        <Route path="/:clientSlug/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/:clientSlug/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
