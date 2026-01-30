// src/components/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <Link className="brand-title" href="/">
            Handcrafted Haven
          </Link>
          <span className="brand-subtitle">artisan marketplace</span>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/artisans">Artisans</Link>
          {/* Login can be wired later when Auth is ready */}
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
