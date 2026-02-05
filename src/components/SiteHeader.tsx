// src/components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";

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
          <Link href="/dashboard">Dashboard</Link>
          <AuthButtons />
        </nav>
      </div>
    </header>
  );
}

