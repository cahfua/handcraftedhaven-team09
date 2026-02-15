"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (status === "loading") return <span style={{ opacity: 0.7 }}>Loading…</span>;

  if (!session?.user) {
    return (
      <button className="btn btn-primary" onClick={() => signIn("github")}>
        Sign in with GitHub
      </button>
    );
  }

  const label = session.user.name ?? session.user.email ?? "user";

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Hi, {label} <span aria-hidden="true" style={{ opacity: 0.7 }}>▾</span>
      </button>

      {open ? (
        <div role="menu" aria-label="Account menu" className="menu">
          <Link role="menuitem" href="/favorites" className="menuItem" onClick={() => setOpen(false)}>
            Favorites
          </Link>

          <Link role="menuitem" href="/wishlist" className="menuItem" onClick={() => setOpen(false)}>
            Wishlist
          </Link>

          <div className="menuDivider" />

          <button role="menuitem" type="button" className="menuItem" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}