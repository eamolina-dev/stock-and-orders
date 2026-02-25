import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { DashboardProducts } from "./components/dashboard/DashboardProducts";
import { DashboardCategories } from "./components/dashboard/DashboardCategories";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={user ? <Home user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/dashboard/products"
          element={
            user ? <DashboardProducts user={user} /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/dashboard/categories"
          element={
            user ? (
              <DashboardCategories user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
