// src/app/favorites/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl?: string | null;
};

export default function FavoritesPage() {
  const [items, setItems] = useState<{ product: Product }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setItems(data.favorites || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Favorites</h1>
        <Link href="/shop">Back to shop</Link>
      </header>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ marginTop: 16 }}>No favorites yet.</p>
      ) : (
        <ul style={{ marginTop: 16, paddingLeft: 18 }}>
          {items.map((f) => (
            <li key={f.product.id} style={{ marginBottom: 10 }}>
              <Link href={`/products/${f.product.id}`}>{f.product.title}</Link>{" "}
              — ${(f.product.priceCents / 100).toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
