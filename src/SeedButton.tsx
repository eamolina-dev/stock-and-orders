import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const runSeed = async () => {
    setLoading(true);
    setDone(false);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("No user logged in");
      setLoading(false);
      return;
    }

    const userId = user.id;

    const categories = [
      { name: "Electrónica", user_id: userId },
      { name: "Libros", user_id: userId },
      { name: "Ropa", user_id: userId },
      { name: "Hogar", user_id: userId },
      { name: "Deportes", user_id: userId },
    ];

    const { data: insertedCategories, error: catError } = await supabase
      .from("categories")
      .insert(categories)
      .select();

    if (catError) {
      console.error(catError);
      alert("Error creating categories");
      setLoading(false);
      return;
    }

    const byName = Object.fromEntries(
      insertedCategories.map((c) => [c.name, c.id])
    );

    const products = [
      {
        name: "Auriculares",
        price: 199.99,
        category_id: byName["Electrónica"],
        user_id: userId,
      },
      {
        name: "Teclado mecánico",
        price: 120,
        category_id: byName["Electrónica"],
        user_id: userId,
      },
      {
        name: "Monitor 27",
        price: 320,
        category_id: byName["Electrónica"],
        user_id: userId,
      },

      {
        name: "Libro de React",
        price: 45,
        category_id: byName["Libros"],
        user_id: userId,
      },
      {
        name: "Clean Code",
        price: 50,
        category_id: byName["Libros"],
        user_id: userId,
      },
      {
        name: "Estructuras de Datos",
        price: 60,
        category_id: byName["Libros"],
        user_id: userId,
      },

      {
        name: "Remera básica",
        price: 25,
        category_id: byName["Ropa"],
        user_id: userId,
      },
      { name: "Buzo", price: 70, category_id: byName["Ropa"], user_id: userId },
      {
        name: "Campera",
        price: 110,
        category_id: byName["Ropa"],
        user_id: userId,
      },

      {
        name: "Lámpara",
        price: 35,
        category_id: byName["Hogar"],
        user_id: userId,
      },
      {
        name: "Silla",
        price: 90,
        category_id: byName["Hogar"],
        user_id: userId,
      },
      {
        name: "Escritorio",
        price: 150,
        category_id: byName["Hogar"],
        user_id: userId,
      },

      {
        name: "Zapatillas running",
        price: 130,
        category_id: byName["Deportes"],
        user_id: userId,
      },
      {
        name: "Mochila",
        price: 80,
        category_id: byName["Deportes"],
        user_id: userId,
      },
      {
        name: "Botella térmica",
        price: 40,
        category_id: byName["Deportes"],
        user_id: userId,
      },

      {
        name: "Mouse",
        price: 60,
        category_id: byName["Electrónica"],
        user_id: userId,
      },
      {
        name: "Notebook",
        price: 900,
        category_id: byName["Electrónica"],
        user_id: userId,
      },
      { name: "Jean", price: 55, category_id: byName["Ropa"], user_id: userId },
      {
        name: "Cuaderno",
        price: 15,
        category_id: byName["Libros"],
        user_id: userId,
      },
      {
        name: "Alfombra",
        price: 65,
        category_id: byName["Hogar"],
        user_id: userId,
      },
    ];

    const { error: prodError } = await supabase
      .from("products")
      .insert(products);

    if (prodError) {
      console.error(prodError);
      alert("Error creating products");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  return (
    <button
      onClick={runSeed}
      disabled={loading}
      className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
    >
      {loading
        ? "Generando datos..."
        : done
        ? "Datos generados ✔"
        : "Generar datos fake"}
    </button>
  );
}
