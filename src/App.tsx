import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./features/admin/components/ProtectedRoute";
import { Home } from "./shared/pages/Home";
import AdminDashboard from "./features/admin/pages/Dashboard";
import AdminLogin from "./features/admin/pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        {/* <Route path="/:clientSlug/products" element={<Home />} /> */}
        <Route path="/:clientSlug/" element={<Home />} />

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Home />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
