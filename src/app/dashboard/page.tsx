// src/app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/api/auth/signin");

  // seller should exist because dashboard/layout.tsx upserts it
  const seller = await prisma.seller.findUnique({
    where: { userId },
    include: { user: true, products: { orderBy: { createdAt: "desc" } } },
  });

  if (!seller) redirect("/dashboard"); // should not happen

  async function updateSeller(formData: FormData) {
    "use server";
    const session = await getSession();
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) redirect("/api/auth/signin");

    const location = String(formData.get("location") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const story = String(formData.get("story") ?? "").trim();

    await prisma.seller.update({
      where: { userId },
      data: {
        location: location || null,
        bio: bio || null,
        story: story || null,
      },
    });

    redirect("/dashboard");
  }

  async function createProduct(formData: FormData) {
    "use server";
    const session = await getSession();
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) redirect("/api/auth/signin");

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const priceStr = String(formData.get("price") ?? "0").trim();

    const price = Number(priceStr);
    if (!title || !description || !category || !Number.isFinite(price) || price <= 0) {
      redirect("/dashboard");
    }

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) redirect("/dashboard");

    await prisma.product.create({
      data: {
        sellerId: seller.id,
        title,
        description,
        category,
        imageUrl: imageUrl || null,
        priceCents: Math.round(price * 100),
      },
    });

    redirect("/dashboard");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const session = await getSession();
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) redirect("/api/auth/signin");

    const productId = String(formData.get("productId") ?? "");

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) redirect("/dashboard");

    // Only delete if it belongs to this seller
    await prisma.product.deleteMany({
      where: { id: productId, sellerId: seller.id },
    });

    redirect("/dashboard");
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Seller Dashboard</h1>
        <nav aria-label="Dashboard navigation" style={{ display: "flex", gap: 12 }}>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href={`/artisans/${seller.id}`}>My Public Profile</Link>
          <Link href="/dashboard/listings">My Listings</Link>
        </nav>
      </header>

      <p style={{ marginTop: 10, opacity: 0.85 }}>
        Logged in as: <strong>{seller.user.name ?? seller.user.email ?? "Unnamed"}</strong>
      </p>

      {/* Edit Profile */}
      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Edit Profile</h2>

        <form action={updateSeller} style={{ display: "grid", gap: 10 }}>
          <label>
            Location
            <input name="location" defaultValue={seller.location ?? ""} style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Bio
            <textarea name="bio" defaultValue={seller.bio ?? ""} rows={3} style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Story
            <textarea name="story" defaultValue={seller.story ?? ""} rows={4} style={{ width: "100%", padding: 8 }} />
          </label>

          <button type="submit" style={{ width: "fit-content", padding: "8px 12px" }}>
            Save Profile
          </button>
        </form>
      </section>

      {/* Create Product */}
      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Create New Product</h2>

        <form action={createProduct} style={{ display: "grid", gap: 10 }}>
          <label>
            Title
            <input name="title" required style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Description
            <textarea name="description" required rows={3} style={{ width: "100%", padding: 8 }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Category
              <input name="category" required placeholder="Ceramics" style={{ width: "100%", padding: 8 }} />
            </label>

            <label>
              Price (USD)
              <input name="price" type="number" min="0.01" step="0.01" required style={{ width: "100%", padding: 8 }} />
            </label>
          </div>

          <label>
            Image URL (optional)
            <input name="imageUrl" placeholder="https://..." style={{ width: "100%", padding: 8 }} />
          </label>

          <button type="submit" style={{ width: "fit-content", padding: "8px 12px" }}>
            Add Product
          </button>

          <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
            Info: Later we can replace Image URL with real file upload.
          </p>
        </form>
      </section>

      {/* My Products */}
      <section style={{ marginTop: 18 }}>
        <h2>My Products</h2>

        {seller.products.length === 0 ? (
          <p>No products yet — add your first listing above.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {seller.products.map((p) => (
              <article key={p.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
                <h3 style={{ marginTop: 0, fontSize: 18 }}>{p.title}</h3>
                <p style={{ margin: "8px 0" }}>{p.description}</p>
                <p style={{ margin: "8px 0", fontWeight: 700 }}>${(p.priceCents / 100).toFixed(2)}</p>
                <p style={{ margin: "8px 0", opacity: 0.8 }}>{p.category}</p>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Link href={`/products/${p.id}`}>View →</Link>

                  <form action={deleteProduct}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button type="submit">Delete</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
