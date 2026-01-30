// src/app/artisans/[id]/page.tsx
// Artisan detail page. Shows artisan info + their products.

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArtisanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const seller = await prisma.seller.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      products: true,
    },
  });

  if (!seller) {
    return (
      <main className="container">
        <h1 className="h1">Artisan not found</h1>
        <Link className="btn btnGhost" href="/artisans">
          Back to Artisans
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <Link className="btn btnGhost" href="/artisans">
        ← Back to Artisans
      </Link>

      <section className="section">
        <h1 className="h1">{seller.user.name}</h1>
        <p className="muted">{seller.bio || "No bio yet."}</p>
      </section>

      <section className="section" aria-label="Artisan products">
        <h2 className="h2">Products</h2>

        {seller.products.length === 0 ? (
          <div className="card">
            <p className="muted">No products listed yet.</p>
          </div>
        ) : (
          <div className="grid">
            {seller.products.map((p: any) => (
              <article key={p.id} className="card">
                <h3 className="h3">{p.title}</h3>
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
