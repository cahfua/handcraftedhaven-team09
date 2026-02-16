// src/app/categories/[slug]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // slug is the category value from URL
  const category = decodeURIComponent(slug).toLowerCase();

  const allProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: { include: { user: true } },
    },
  });

  const products = allProducts.filter(
    (p) => p.category.toLowerCase() === category
  );


  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Link href="/categories">← Categories</Link>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/shop">Shop</Link>
          <Link href="/artisans">Artisans</Link>
        </nav>
      </header>

      <h1 style={{ marginTop: 16 }}>{category}</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        {products.length} item{products.length === 1 ? "" : "s"} in this category
      </p>

      {products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {products.map((p) => (
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
              <p style={{ margin: "8px 0", fontWeight: 700 }}>
                ${(p.priceCents / 100).toFixed(2)}
              </p>
              <p style={{ margin: "8px 0", opacity: 0.8 }}>
                Seller: {p.seller.user.name}
              </p>

              <Link href={`/products/${p.id}`}>View details →</Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
