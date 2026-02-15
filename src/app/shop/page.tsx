// src/app/shop/page.tsx
"use client";

// “Shop” browsing page

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const knownCategories = ["Misc", "Woodworking", "Textiles", "Ceramics", "Painting"];
const PAGE_SIZE = 12;

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
  const pageParam = Math.max(1, Number(searchParams.get("page") || "1"));

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Favorites/Wishlist state (store productIds)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // UI state synced with URL
  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState<SortOption>(sortParam);

  // If URL changes (back/forward/paste URL), update UI state
  useEffect(() => {
    setQuery(qParam);
    setSort(sortParam);
  }, [qParam, sortParam]);

  function updateUrl(next: { category?: string; q?: string; sort?: SortOption; page?: number }) {
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

    // page
    if (next.page !== undefined) {
      if (!next.page || next.page <= 1) params.delete("page");
      else params.set("page", String(next.page));
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

  // Load favorites + wishlist (if logged in)
  useEffect(() => {
    // Favorites
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        const ids = new Set<string>();
        for (const f of data?.favorites || []) {
          const pid = f?.product?.id;
          if (pid) ids.add(pid);
        }
        setFavoriteIds(ids);
      })
      .catch(() => {
        // not logged in -> ignore
      });

    // Wishlist
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        const ids = new Set<string>();
        for (const w of data?.wishlist || []) {
          const pid = w?.product?.id;
          if (pid) ids.add(pid);
        }
        setWishlistIds(ids);
      })
      .catch(() => {
        // ignore
      });
  }, []);

  async function toggleFavorite(productId: string) {
    // optimistic toggle
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 401) {
      alert("Please sign in to favorite items.");
      // revert
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
      return;
    }

    if (!res.ok) {
      alert("Could not update favorite. Try again.");
      // revert
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    }
  }

  async function toggleWishlist(productId: string) {
    // optimistic toggle
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 401) {
      alert("Please sign in to add items to your wishlist.");
      // revert
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
      return;
    }

    if (!res.ok) {
      alert("Could not update wishlist. Try again.");
      // revert
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    }
  }

  // Build category options from products and known list
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

  function getCategoryLabel(slug: string) {
    const found = categories.find((c) => c.toLowerCase() === slug.toLowerCase());
    return found || slug;
  }

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
    if (sort === "price-asc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "price-desc") sorted.sort((a, b) => b.priceCents - a.priceCents);
    // "newest" keeps API order

    return sorted;
  }, [products, categoryParam, query, sort]);

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(pageParam, totalPages);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return (
    <main className="container section">
      <header className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="h1">Shop</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Browse handcrafted items, filter by category, and save favorites.
          </p>
        </div>

        <nav className="row" aria-label="Shop navigation" style={{ justifyContent: "flex-end" }}>
          <Link className="btn btn-ghost" href="/">Home</Link>
          <Link className="btn btn-ghost" href="/categories">Categories</Link>
          <Link className="btn btn-ghost" href="/artisans">Artisans</Link>
        </nav>
      </header>

      {/* Filter bar */}
      <section className="card" style={{ marginTop: 14 }}>
        <div className="row">
          {/* Category */}
          <label className="field" style={{ minWidth: 220 }}>
            <span style={{ fontWeight: 650 }}>Category</span>
            <select
              value={categoryParam}
              onChange={(e) => updateUrl({ category: e.target.value, page: 1 })}
              className="control"
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
          <label className="field" style={{ minWidth: 260, flex: 1 }}>
            <span style={{ fontWeight: 650 }}>Search</span>
            <input
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                updateUrl({ q: val, page: 1 });
              }}
              placeholder="Search products…"
              className="control"
              aria-label="Search products"
            />
          </label>

          {/* Sort */}
          <label className="field" style={{ minWidth: 220 }}>
            <span style={{ fontWeight: 650 }}>Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                const val = e.target.value as SortOption;
                setSort(val);
                updateUrl({ sort: val, page: 1 });
              }}
              className="control"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </label>

          {/* Clear */}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              updateUrl({ q: "", page: 1 });
            }}
            className="btn btn-ghost"
            disabled={!query}
            aria-disabled={!query}
          >
            Clear
          </button>
        </div>

        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          Showing <strong>{totalItems}</strong> items (showing {paged.length} on this page)
          {categoryParam ? (
            <>
              {" "}
              in <strong>{getCategoryLabel(categoryParam)}</strong>
            </>
          ) : null}
        </p>
      </section>

      {/* Pagination */}
      {!loading && totalItems > 0 ? (
        <section className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
          <div className="row">
            <button
              type="button"
              onClick={() => updateUrl({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="btn"
            >
              ← Prev
            </button>

            <button
              type="button"
              onClick={() => updateUrl({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="btn"
            >
              Next →
            </button>

            <span className="muted" style={{ marginLeft: 6 }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          </div>

          <label className="row" style={{ gap: 8 }}>
            <span style={{ fontWeight: 650 }}>Go to:</span>
            <select
              value={currentPage}
              onChange={(e) => updateUrl({ page: Number(e.target.value) })}
              className="control"
              style={{ width: 120 }}
              aria-label="Go to page"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {/* Products */}
      {loading ? (
        <p style={{ marginTop: 18 }}>Loading products…</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted" style={{ margin: 0 }}>No products found.</p>
        </div>
      ) : (
        <section className="grid" style={{ marginTop: 16 }}>
          {paged.map((p) => {
            const isFav = favoriteIds.has(p.id);
            const isWish = wishlistIds.has(p.id);

            return (
              <article key={p.id} className="card">
                <div className="media">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} loading="lazy" />
                  ) : (
                    <div className="placeholder" aria-hidden="true">
                      <span>{p.title.slice(0, 1).toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <h2 className="h3" style={{ fontSize: 18 }}>{p.title}</h2>
                <p className="muted" style={{ marginTop: 8, marginBottom: 10 }}>
                  {p.description}
                </p>

                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="badge">${(p.priceCents / 100).toFixed(2)}</span>
                  <span className="badge">{p.category}</span>
                </div>

                <div className="row" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(p.id)}
                    className={isFav ? "btn btn-primary" : "btn"}
                    aria-pressed={isFav}
                    aria-label={`Toggle favorite for ${p.title}`}
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFav ? "♥ Favorited" : "♡ Favorite"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(p.id)}
                    className={isWish ? "btn btn-secondary" : "btn"}
                    aria-pressed={isWish}
                    aria-label={`Toggle wishlist for ${p.title}`}
                    title={isWish ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isWish ? "★ Wishlisted" : "☆ Wishlist"}
                  </button>

                  <Link className="btn btn-ghost" href={`/products/${p.id}`}>
                    View →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}