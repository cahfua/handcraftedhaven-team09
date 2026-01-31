// src/app/categories/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  // Pull distinct categories from products
  const products = await prisma.product.findMany({
    select: { category: true },
  });

  const categories = Array.from(
    new Set(products.map((p) => p.category.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Categories</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/artisans">Artisans</Link>
        </nav>
      </header>

      <p style={{ marginTop: 10, opacity: 0.8 }}>
        Browse handcrafted items by category.
      </p>

      {categories.length === 0 ? (
        <p>No categories yet. Add products first.</p>
      ) : (
        <ul style={{ marginTop: 14, display: "grid", gap: 8, paddingLeft: 18 }}>
          {categories.map((c) => (
            <li key={c}>
              <Link href={`/categories/${encodeURIComponent(c)}`}>{c}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
