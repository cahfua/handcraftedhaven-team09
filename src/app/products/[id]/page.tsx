//src/app/products/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string };
};

type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  category: string;
  seller: { user: { name: string } };
  reviews: Review[];
};

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // TEMP user for MVP demo
  const demoUserId = "demo-user-id";

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [id]);

  async function submitReview() {
    if (!comment.trim()) return;

    setSubmitting(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        userId: demoUserId,
        rating: Number(rating),
        comment,
      }),
    });
    setComment("");
    const updated = await fetch(`/api/products/${id}`).then((r) => r.json());
    setProduct(updated);
    setSubmitting(false);
  }

  if (!product) return <p style={{ padding: 24 }}>Loading…</p>;

  const avg =
    product.reviews.length === 0
      ? null
      : product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <Link href="/shop">← Back to shop</Link>
        <Link href="/">Home</Link>
      </header>

      <h1 style={{ marginBottom: 8 }}>{product.title}</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>by {product.seller.user.name}</p>
      <p style={{ fontWeight: 700 }}>${(product.priceCents / 100).toFixed(2)}</p>
      <p>{product.description}</p>
      <p><strong>Category:</strong> {product.category}</p>

      <section aria-label="Reviews" style={{ marginTop: 28 }}>
        <h2>Reviews</h2>
        <p>
          <strong>Average rating:</strong>{" "}
          {avg === null ? "No reviews yet" : `${avg.toFixed(1)} / 5 (${product.reviews.length})`}
        </p>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Leave a review</h3>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ display: "block" }}>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </label>
          <label style={{ display: "block", marginTop: 10 }}>
            Comment
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{ width: "100%" }}
            />
          </label>
          <button onClick={submitReview} disabled={submitting} style={{ marginTop: 10 }}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            (Demo mode: review submits using a placeholder user.)
          </p>
        </div>

        <ul style={{ marginTop: 14, paddingLeft: 18 }}>
          {product.reviews.map((r) => (
            <li key={r.id} style={{ marginBottom: 10 }}>
              <strong>{r.rating}/5</strong> — {r.comment}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
