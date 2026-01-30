// src/components/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ opacity: 0.85, fontSize: 14 }}>
          © {new Date().getFullYear()} Handcrafted Haven
        </div>

        <div className="footer-links" aria-label="Footer links">
          <Link href="/accessibility">Accessibility</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
