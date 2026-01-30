// src/app/page.tsx
import Link from "next/link";

const categories = ["Misc", "Woodworking", "Textiles", "Ceramics", "Painting"];

export default function HomePage() {
  return (
    <div className="hero">
      <section className="section">
        <div className="container">
          <div className="hero-card">
            <h1 className="hero-title">Discover unique handmade treasures</h1>
            <p className="hero-lead">
              A marketplace for artisans to share their story and sell handcrafted goods.
            </p>

            <div className="actions">
              <Link className="btn btn-primary" href="/shop">
                Browse Products →
              </Link>
              <Link className="btn" href="/artisans">
                Meet the Artisans →
              </Link>
            </div>

            <div className="chips" aria-label="Popular categories">
              {categories.map((c) => (
                <Link key={c} className="chip" href={`/categories/${encodeURIComponent(c.toLowerCase())}`}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section (placeholder for now — wire to real featured later) */}
      <section className="section-tight">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 14 }}>Featured</h2>
          <div className="grid-3">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Hand-picked categories</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Explore the most popular styles from our makers.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Support local artisans</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Every purchase helps creators keep crafting.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Trust the reviews</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Ratings highlight quality work and build confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Handcrafted Haven */}
      <section className="section">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 14 }}>Why Handcrafted Haven?</h2>
          <div className="grid-3">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Support local artisans</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Learn the story behind each piece and meet the maker.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Sustainable consumption</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Choose items made with care, not mass production.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Unique handmade items</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Find one-of-a-kind pieces you won’t see everywhere.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link className="btn" href="/shop">Start shopping →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
