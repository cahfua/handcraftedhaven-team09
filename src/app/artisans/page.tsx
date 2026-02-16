// src/app/artisans/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArtisansPage() {
  const sellers = await prisma.seller.findMany({
    include: { user: true, products: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container section">
      <header className="section-tight" style={{ paddingTop: 0 }}>
        <h1 className="h1">Artisans</h1>
        <p className="muted">Meet the creators behind the work.</p>
      </header>

      <section className="grid" aria-label="Artisan list">
        {sellers.map((s: any) => {
          const name = s.user?.name ?? s.user?.email ?? "Artisan";
          const initial = String(name).trim().slice(0, 1).toUpperCase();

          return (
            <article key={s.id} className="card">
              {/* Avatar / placeholder */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                {s.avatarUrl ? (
                  // avatarUrl placeholder
                  <img
                    src={s.avatarUrl}
                    alt={`${name} avatar`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      objectFit: "cover",
                      border: "1px solid var(--border)",
                    }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background:
                        "linear-gradient(135deg, rgba(18,183,190,0.20), rgba(226,184,87,0.25))",
                      border: "1px solid var(--border)",
                      fontWeight: 700,
                    }}
                  >
                    {initial}
                  </div>
                )}

                <div>
                  <h2 className="h2" style={{ fontSize: 18, margin: 0 }}>
                    {name}
                  </h2>
                  <p className="muted" style={{ margin: 0 }}>
                    {s.bio || "No bio yet."}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span className="badge">Products: {s.products?.length ?? 0}</span>

                <Link className="btn btn-primary" href={`/artisans/${s.id}`}>
                  View profile →
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <div className="section-tight">
        <Link className="btn" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}