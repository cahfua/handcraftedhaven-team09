//src/app/dashboard/listings/[id]/page.tsx
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getSellerForUser(userId: string) {
  return prisma.seller.findUnique({ where: { userId } });
}

async function getProductForSeller(productId: string, sellerId: string) {
  return prisma.product.findFirst({
    where: { id: productId, sellerId },
  });
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/api/auth/signin");

  const seller = await getSellerForUser(userId);
  if (!seller) {
    
    redirect("/dashboard");
  }

  const product = await getProductForSeller(id, seller.id);
  if (!product) notFound();

  async function updateProduct(formData: FormData) {
    "use server";

    const session = await getSession();
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) redirect("/api/auth/signin");

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) redirect("/dashboard");

    const productId = String(formData.get("productId") || "");
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const price = Number(formData.get("price") || 0);
    const imageUrlRaw = String(formData.get("imageUrl") || "").trim();
    const imageUrl = imageUrlRaw ? imageUrlRaw : null;

    if (!productId || !title || !description || !category || !price || price <= 0) {
      // simplest: just redirect back for now
      redirect(`/dashboard/listings/${productId}?error=missing`);
    }

    const priceCents = Math.round(price * 100);

    // IMPORTANT: only update if this product belongs to this seller
    await prisma.product.updateMany({
      where: { id: productId, sellerId: seller.id },
      data: { title, description, category, priceCents, imageUrl },
    });

    redirect("/dashboard/listings");
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Edit Listing</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard/listings">← Back to My Listings</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <form action={updateProduct} style={{ display: "grid", gap: 10 }}>
          <input type="hidden" name="productId" value={product.id} />

          <label>
            Title
            <input
              name="title"
              defaultValue={product.title}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Category
              <input
                name="category"
                defaultValue={product.category}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label>
              Price (USD)
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                required
                defaultValue={(product.priceCents / 100).toFixed(2)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
          </div>

          <label>
            Image URL (optional)
            <input
              name="imageUrl"
              defaultValue={product.imageUrl ?? ""}
              placeholder="https://..."
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          {product.imageUrl ? (
            <div style={{ marginTop: 6 }}>
              <p style={{ margin: "0 0 8px 0", opacity: 0.8 }}>Current image preview:</p>
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: "100%", maxWidth: 420, height: 220, objectFit: "cover", borderRadius: 10, border: "1px solid #eee" }}
              />
            </div>
          ) : null}

          <button type="submit" style={{ width: "fit-content", padding: "8px 12px" }}>
            Save Changes
          </button>
        </form>
      </section>
    </main>
  );
}
