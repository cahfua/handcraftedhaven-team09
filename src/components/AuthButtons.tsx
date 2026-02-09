"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close on ESC
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
      {/* Trigger */}
      <button
        type="button"
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        Hi, {label}
        <span aria-hidden="true" style={{ opacity: 0.7 }}>▾</span>
      </button>

      {/* Dropdown */}
      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 180,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "white",
            padding: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            zIndex: 50,
          }}
        >
          <Link
            role="menuitem"
            href="/favorites"
            className="btn"
            onClick={() => setOpen(false)}
            style={{
              width: "100%",
              display: "block",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 10,
            }}
          >
            Favorites
          </Link>

          <Link
            role="menuitem"
            href="/wishlist"
            className="btn"
            onClick={() => setOpen(false)}
            style={{
              width: "100%",
              display: "block",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 10,
              marginTop: 4,
            }}
          >
            Wishlist
          </Link>

          <div style={{ height: 1, background: "#eee", margin: "8px 0" }} />

          <button
            role="menuitem"
            type="button"
            className="btn"
            onClick={() => signOut()}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 10,
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}