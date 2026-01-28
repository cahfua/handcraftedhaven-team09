// src/app/artisans/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArtisansPage() {
  const sellers = await prisma.seller.findMany({
    include: { user: true, products: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h1>Artisans</h1>
        <Link href="/">Home</Link>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 16 }}>
        {sellers.map((s) => (
          <article key={s.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{s.user.name}</h2>
            <p style={{ margin: "8px 0" }}>{s.bio || "No bio yet."}</p>
            <p style={{ margin: "8px 0", opacity: 0.8 }}>
              Products: {s.products.length}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
