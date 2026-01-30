// src/app/shop/page.tsx
"use client";

// This is the “Shop” browsing page. Styling is class-based

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string | null;
};

export default function ShopPage() {
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (min) params.set("min", min);
    if (max) params.set("max", max);
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [category, min, max]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products${query}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <main className="container">
      <h1 className="h1">Shop</h1>
      <p className="muted">Filter products by category or price range.</p>

      <section className="filters" aria-label="Filters">
        <label className="label">
          Category
          <input
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ceramics"
          />
        </label>
        <label className="label">
          Min price ($)
          <input
            className="input"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            inputMode="numeric"
            placeholder="10"
          />
        </label>
        <label className="label">
          Max price ($)
          <input
            className="input"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            inputMode="numeric"
            placeholder="100"
          />
        </label>
      </section>

      <section className="section" aria-label="Results">
        {loading ? (
          <p>Loading…</p>
        ) : products.length === 0 ? (
          <div className="card">
            <p className="muted">No products found. Try a different filter.</p>
            <Link className="btn btnGhost" href="/">
              Back home
            </Link>
          </div>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <article key={p.id} className="card">
                <h2 className="h3">{p.title}</h2>
                <p className="muted">{p.description}</p>

                <div className="cardMeta">
                  <span className="price">${(p.priceCents / 100).toFixed(2)}</span>
                  <span className="badge">{p.category}</span>
                </div>

                <div style={{ marginTop: 10 }}>
                  <Link className="btn btnPrimary" href={`/products/${p.id}`}>
                    View details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

