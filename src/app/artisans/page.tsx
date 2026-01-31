// src/app/artisans/page.tsx
// server-side (good for Prisma). Styling is shared via classes.

import { prisma } from "@/lib/prisma";
import Link from "next/link";


export default async function ArtisansPage() {
  const sellers = await prisma.seller.findMany({
    include: { user: true, products: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container">
      <h1 className="h1">Artisans</h1>
      <p className="muted">Meet the creators behind the work.</p>

      <div className="grid" aria-label="Artisan list">
        {sellers.map((s: any) => (
          <article key={s.id} className="card">
            <h2 className="h3">{s.user.name}</h2>
            <p className="muted">{s.bio || "No bio yet."}</p>

            <div className="cardMeta">
              <span className="badge">Products: {s.products.length}</span>
              <Link className="btn btnPrimary" href={`/artisans/${s.id}`}>
                View profile →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="section">
        <Link className="btn btnGhost" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}

