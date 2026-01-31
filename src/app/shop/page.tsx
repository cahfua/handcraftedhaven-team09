// src/app/shop/page.tsx
"use client";

// This is the “Shop” browsing page. Styling is class-based


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string | null;
};

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryParam = (searchParams.get("category") || "").toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products
  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  // Build category options from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category?.trim()) set.add(p.category.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Filter products by selected category (case-insensitive)
  const filtered = useMemo(() => {
    if (!categoryParam) return products;
    return products.filter((p) => p.category.toLowerCase() === categoryParam);
  }, [products, categoryParam]);

  function onCategoryChange(value: string) {
    // value is already lowercase slug (or "" for all)
    if (!value) {
      router.push("/shop");
    } else {
      router.push(`/shop?category=${encodeURIComponent(value)}`);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Shop</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/">Home</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/artisans">Artisans</Link>
        </nav>
      </header>

      {/* Filter bar */}
      <section style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Category:</span>
          <select
            value={categoryParam}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{ padding: 8, borderRadius: 8 }}
            aria-label="Filter by category"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c.toLowerCase()}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <p style={{ margin: 0, opacity: 0.75 }}>
          Showing <strong>{filtered.length}</strong> item{filtered.length === 1 ? "" : "s"}
          {categoryParam ? (
            <>
              {" "}
              in <strong>{categoryParam}</strong>
            </>
          ) : null}
        </p>
      </section>

      {/* Products */}
      {loading ? (
        <p style={{ marginTop: 18 }}>Loading products…</p>
      ) : filtered.length === 0 ? (
        <p style={{ marginTop: 18 }}>No products found for that category.</p>
      ) : (
        <section
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((p) => (
            <article key={p.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 10,
                    marginBottom: 10,
                    border: "1px solid #eee",
                  }}
                  loading="lazy"
                />
              ) : null}

              <h2 style={{ marginTop: 0, fontSize: 18 }}>{p.title}</h2>
              <p style={{ margin: "8px 0" }}>{p.description}</p>
              <p style={{ margin: "8px 0", fontWeight: 700 }}>${(p.priceCents / 100).toFixed(2)}</p>
              <p style={{ margin: "8px 0", opacity: 0.75 }}>{p.category}</p>

              <Link href={`/products/${p.id}`}>View details →</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
