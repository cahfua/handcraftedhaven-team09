// src/app/dashboard/listings/[productId]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: { include: { user: true } } },
  });

  if (!product) {
    return (
      <main style={{ padding: 24 }}>
        <p>Product not found.</p>
        <Link href="/dashboard/listings">← Back to listings</Link>
      </main>
    );
  }

  async function updateProduct(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "");
    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price") || 0);

    if (!id || !title || !category || !description || !price || price <= 0) return;

    await prisma.product.update({
      where: { id },
      data: {
        title,
        category,
        description,
        priceCents: Math.round(price * 100),
      },
    });

    revalidatePath("/shop");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath(`/products/${id}`);
    revalidatePath(`/artisans/${product.sellerId}`);

    redirect("/dashboard/listings");
  }

  async function deleteProduct(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "");
    if (!id) return;

    await prisma.product.delete({ where: { id } });

    revalidatePath("/shop");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath(`/artisans/${product.sellerId}`);

    redirect("/dashboard/listings");
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard/listings">← Back to listings</Link>
        <Link href="/dashboard">Dashboard</Link>
      </header>

      <h1 style={{ marginTop: 16 }}>Edit Listing</h1>
      <p style={{ marginTop: 6, opacity: 0.85 }}>
        Seller: <strong>{product.seller.user.name}</strong>
      </p>

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <form action={updateProduct} style={{ display: "grid", gap: 10 }}>
          <input type="hidden" name="id" value={product.id} />

          <label>
            Title
            <input name="title" defaultValue={product.title} required style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Category
            <input name="category" defaultValue={product.category} required style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Price (USD)
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={(product.priceCents / 100).toFixed(2)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              defaultValue={product.description}
              required
              rows={4}
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <button type="submit" style={{ width: "fit-content", padding: "8px 12px" }}>
            Save Changes
          </button>
        </form>
      </section>

      <section style={{ marginTop: 14 }}>
        <h2>Danger zone</h2>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <button type="submit">Delete Product</button>
        </form>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          Deleting removes it from the shop and public profile.
        </p>
      </section>
    </main>
  );
}
