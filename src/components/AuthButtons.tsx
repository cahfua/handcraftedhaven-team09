//src/components/AuthButtons.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return <span style={{ opacity: 0.7 }}>Loading…</span>;

  if (!session?.user) {
    return (
      <button className="btn btn-primary" onClick={() => signIn("github")}>
        Sign in with GitHub
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ opacity: 0.8 }}>
        Hi, {session.user.name ?? session.user.email ?? "user"}
      </span>
      <button className="btn" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
