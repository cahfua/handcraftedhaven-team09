// src/app/shop/page.tsx
"use client";

// This is the “Shop” browsing page. Styling is class-based

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const knownCategories = ["Misc", "Woodworking", "Textiles", "Ceramics", "Painting"];

type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string | null;
};

type SortOption = "newest" | "price-asc" | "price-desc";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const categoryParam = (searchParams.get("category") || "").toLowerCase();
  const qParam = searchParams.get("q") || "";
  const sortParam = (searchParams.get("sort") || "newest") as SortOption;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state synced with URL
  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState<SortOption>(sortParam);

  // If URL changes (back/forward/paste URL), update UI state
  useEffect(() => {
    setQuery(qParam);
    setSort(sortParam);
  }, [qParam, sortParam]);

  function updateUrl(next: { category?: string; q?: string; sort?: SortOption }) {
    const params = new URLSearchParams(searchParams.toString());

    // category
    if (next.category !== undefined) {
      if (!next.category) params.delete("category");
      else params.set("category", next.category);
    }

    // q (search)
    if (next.q !== undefined) {
      const trimmed = next.q.trim();
      if (!trimmed) params.delete("q");
      else params.set("q", trimmed);
    }

    // sort
    if (next.sort !== undefined) {
      if (!next.sort || next.sort === "newest") params.delete("sort");
      else params.set("sort", next.sort);
    }

    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  // Load products
  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  function getCategoryLabel(slug: string) {
  const found = categories.find(
    (c) => c.toLowerCase() === slug.toLowerCase()
  );
  return found || slug;
}


  // Build category options from products + known list
  const categories = useMemo(() => {
    const set = new Set<string>();

    for (const c of knownCategories) {
      if (c.trim()) set.add(c.trim());
    }

    for (const p of products) {
      if (p.category?.trim()) set.add(p.category.trim());
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Filter + search + sort
  const filtered = useMemo(() => {
    // 1) category filter
    let result = categoryParam
      ? products.filter((p) => p.category.toLowerCase() === categoryParam)
      : products;

    // 2) search filter (title + description + category)
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const haystack = `${p.title} ${p.description} ${p.category}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    // 3) sort
    const sorted = [...result];
    if (sort === "price-asc") {
      sorted.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.priceCents - a.priceCents);
    }
    // "newest" = keep API order 

    return sorted;
  }, [products, categoryParam, query, sort]);

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
        {/* Category */}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Category:</span>
          <select
            value={categoryParam}
            onChange={(e) => updateUrl({ category: e.target.value })}
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

        {/* Search */}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Search:</span>
          <input
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              updateUrl({ q: val });
            }}
            placeholder="Search products…"
            style={{ padding: 8, borderRadius: 8, minWidth: 220 }}
            aria-label="Search products"
          />
        </label>

        {/* Sort */}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Sort:</span>
          <select
            value={sort}
            onChange={(e) => {
              const val = e.target.value as SortOption;
              setSort(val);
              updateUrl({ sort: val });
            }}
            style={{ padding: 8, borderRadius: 8 }}
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </label>

        {/* Clear search */}
        <button
          type="button"
          onClick={() => {
            setQuery("");
            updateUrl({ q: "" });
          }}
          style={{ padding: "8px 12px", borderRadius: 8 }}
          disabled={!query}
        >
          Clear
        </button>

        <p style={{ margin: 0, opacity: 0.75 }}>
          Showing <strong>{filtered.length}</strong> item{filtered.length === 1 ? "" : "s"}
          {categoryParam ? (
            <>
             {" "}
             in <strong>{getCategoryLabel(categoryParam)}</strong>
            </>
          ) : null}

        </p>
      </section>

      {/* Products */}
      {loading ? (
        <p style={{ marginTop: 18 }}>Loading products…</p>
      ) : filtered.length === 0 ? (
        <p style={{ marginTop: 18 }}>No products found.</p>
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
