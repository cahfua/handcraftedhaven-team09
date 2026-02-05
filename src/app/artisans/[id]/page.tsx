// src/app/artisans/[id]/page.tsx
// Artisan detail page. Shows artisan info and their products.

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
    include: {
      user: true,
      products: true,
    },
  });

  if (!seller) {
    return (
      <main style={{ padding: 24 }}>
        <p>Seller not found.</p>
        <Link href="/artisans">← Back</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/artisans">← Back</Link>
        <Link href="/shop">Shop</Link>
      </header>

      <h1 style={{ marginTop: 16 }}>{seller.user.name}</h1>

      {seller.location && <p><strong>Location:</strong> {seller.location}</p>}
      {seller.bio && <p><strong>Bio:</strong> {seller.bio}</p>}
      {seller.story && <p><strong>Story:</strong> {seller.story}</p>}

      <h2 style={{ marginTop: 20 }}>Products</h2>
      {seller.products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {seller.products.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.id}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
