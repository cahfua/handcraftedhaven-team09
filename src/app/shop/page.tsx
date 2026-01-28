// src/app/shop/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  category: string;
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
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h1>Shop</h1>
        <Link href="/">Home</Link>
      </header>

      <section aria-label="Filters" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <label>
          Category
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ceramics" style={{ width: "100%" }} />
        </label>
        <label>
          Min price ($)
          <input value={min} onChange={(e) => setMin(e.target.value)} inputMode="numeric" style={{ width: "100%" }} />
        </label>
        <label>
          Max price ($)
          <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="numeric" style={{ width: "100%" }} />
        </label>
      </section>

      <section style={{ marginTop: 20 }}>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {products.map((p) => (
              <article key={p.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
                <h2 style={{ marginTop: 0, fontSize: 18 }}>{p.title}</h2>
                <p style={{ margin: "8px 0" }}>{p.description}</p>
                <p style={{ margin: "8px 0", fontWeight: 600 }}>${(p.priceCents / 100).toFixed(2)}</p>
                <p style={{ margin: "8px 0", opacity: 0.8 }}>{p.category}</p>
                <Link href={`/products/${p.id}`}>View details →</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
