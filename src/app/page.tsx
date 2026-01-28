// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h1>Handcrafted Haven</h1>
        <nav aria-label="Primary">
          <Link href="/shop">Shop</Link>
          {" · "}
          <Link href="/artisans">Artisans</Link>
        </nav>
      </header>

      <section style={{ marginTop: 28 }}>
        <h2>Discover unique handmade treasures</h2>
        <p>
          A marketplace for artisans to share their story and sell handcrafted goods.
        </p>
        <Link href="/shop">Browse Products →</Link>
      </section>
    </main>
  );
}
