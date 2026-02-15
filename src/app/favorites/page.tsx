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
    <main className="container section">
      <header className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h1">Favorites</h1>
        <Link className="btn btn-ghost" href="/shop">Back to shop</Link>
      </header>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : items.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted" style={{ margin: 0 }}>No favorites yet.</p>
        </div>
      ) : (
        <section className="grid" style={{ marginTop: 16 }}>
          {items.map((f) => (
            <article key={f.product.id} className="card">
              <div className="media">
                {f.product.imageUrl ? (
                  <img src={f.product.imageUrl} alt={f.product.title} loading="lazy" />
                ) : (
                  <div className="placeholder" aria-hidden="true">
                    <span>{f.product.title.slice(0, 1).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <h2 className="h3" style={{ fontSize: 18 }}>{f.product.title}</h2>
              <div className="cardMeta">
                <span className="badge">${(f.product.priceCents / 100).toFixed(2)}</span>
                <Link className="btn btn-primary" href={`/products/${f.product.id}`}>
                  View →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}