import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { hasAdminConfigured, isConfiguredAdmin } from "./lib/auth";

import Login from "./pages/Login";
import { Home } from "./pages/Home";
import { DashboardProducts } from "./components/dashboard/DashboardProducts";
import { DashboardCategories } from "./components/dashboard/DashboardCategories";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;

        if (sessionUser && !isConfiguredAdmin(sessionUser.email)) {
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        setUser(sessionUser);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  const isAdmin = isConfiguredAdmin(user?.email);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login isAdmin={isAdmin} hasAdminConfigured={hasAdminConfigured} />}
        />

        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            isAdmin ? <Navigate to="/dashboard/products" replace /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/dashboard/products"
          element={
            isAdmin ? <DashboardProducts user={user} /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/dashboard/categories"
          element={
            isAdmin ? (
              <DashboardCategories user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
