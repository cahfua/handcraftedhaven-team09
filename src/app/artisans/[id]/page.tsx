// src/app/artisans/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ArtisanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seller = await prisma.seller.findUnique({
    where: { id },
    include: { user: true, products: true },
  });

  if (!seller) {
    return (
      <main className="container section">
        <p>Seller not found.</p>
        <Link href="/artisans">← Back</Link>
      </main>
    );
  }

  const name = seller.user.name ?? "Artisan";

  return (
    <main className="container section">
      <header className="row" style={{ justifyContent: "space-between" }}>
        <Link className="btn btn-ghost" href="/artisans">
          ← Back
        </Link>
        <Link className="btn btn-ghost" href="/shop">
          Shop
        </Link>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "minmax(260px, 360px) 1fr", marginTop: 16 }}>
        <section className="card">
          <div className="media" aria-hidden="true" style={{ height: 220 }}>
            <div className="placeholder">
              <span>{name.slice(0, 1).toUpperCase()}</span>
            </div>
          </div>

          <h1 className="h2" style={{ marginTop: 6 }}>{name}</h1>

          <div className="stack" style={{ marginTop: 12 }}>
            {seller.location ? (
              <p style={{ margin: 0 }}><strong>Location:</strong> {seller.location}</p>
            ) : null}
            {seller.bio ? (
              <p style={{ margin: 0 }}><strong>Bio:</strong> {seller.bio}</p>
            ) : (
              <p className="muted" style={{ margin: 0 }}>No bio yet.</p>
            )}
            {seller.story ? (
              <p style={{ margin: 0 }}><strong>Story:</strong> {seller.story}</p>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="h2" style={{ marginTop: 0 }}>Products</h2>

          {seller.products.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>No products yet.</p>
          ) : (
            <div className="grid" style={{ marginTop: 14 }}>
              {seller.products.map((p) => (
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

                  <h3 className="h3" style={{ fontSize: 18 }}>{p.title}</h3>
                  <p className="muted" style={{ marginTop: 8, marginBottom: 10 }}>
                    {p.description}
                  </p>

                  <div className="cardMeta">
                    <span className="badge">${(p.priceCents / 100).toFixed(2)}</span>
                    <Link className="btn btn-primary" href={`/products/${p.id}`}>
                      View →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}