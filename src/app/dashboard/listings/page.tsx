// src/app/dashboard/listings/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getDemoSeller() {
  return prisma.seller.findFirst({
    include: { user: true, products: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "asc" },
  });
}

export default async function ListingsPage() {
  const seller = await getDemoSeller();

  if (!seller) {
    return (
      <main style={{ padding: 24 }}>
        <p>No seller found.</p>
        <Link href="/dashboard">← Back to dashboard</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>My Listings</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/shop">Shop</Link>
        </nav>
      </header>

      <p style={{ marginTop: 10, opacity: 0.85 }}>
        Seller (demo): <strong>{seller.user.name}</strong>
      </p>

      {seller.products.length === 0 ? (
        <p>You don’t have any products yet. Add one in the dashboard.</p>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {seller.products.map((p) => (
            <article
              key={p.id}
              style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", gap: 12 }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>{p.title}</h2>
                <p style={{ margin: "6px 0", opacity: 0.85 }}>{p.category}</p>
                <p style={{ margin: "6px 0", fontWeight: 700 }}>${(p.priceCents / 100).toFixed(2)}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <Link href={`/products/${p.id}`}>View</Link>
                <Link href={`/dashboard/listings/${p.id}`}>Edit →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
