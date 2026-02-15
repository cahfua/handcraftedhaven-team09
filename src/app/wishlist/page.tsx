// src/app/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl?: string | null;
};

export default function WishlistPage() {
  const [items, setItems] = useState<{ product: Product }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setItems(data.wishlist || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container section">
      <header className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h1">Wishlist</h1>
        <Link className="btn btn-ghost" href="/shop">Back to shop</Link>
      </header>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : items.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted" style={{ margin: 0 }}>No wishlist items yet.</p>
        </div>
      ) : (
        <section className="grid" style={{ marginTop: 16 }}>
          {items.map((w) => (
            <article key={w.product.id} className="card">
              <div className="media">
                {w.product.imageUrl ? (
                  <img src={w.product.imageUrl} alt={w.product.title} loading="lazy" />
                ) : (
                  <div className="placeholder" aria-hidden="true">
                    <span>{w.product.title.slice(0, 1).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <h2 className="h3" style={{ fontSize: 18 }}>{w.product.title}</h2>
              <div className="cardMeta">
                <span className="badge">${(w.product.priceCents / 100).toFixed(2)}</span>
                <Link className="btn btn-primary" href={`/products/${w.product.id}`}>
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