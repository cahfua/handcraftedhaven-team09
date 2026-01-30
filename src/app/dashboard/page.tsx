// src/app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getDemoSeller() {
  // For now: dashboard uses the first seller found.
  // Later, this will be replaced with real auth (logged-in seller).
  return prisma.seller.findFirst({
    include: { user: true, products: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "asc" },
  });
}

export default async function DashboardPage() {
  const seller = await getDemoSeller();

  if (!seller) {
    return (
      <main style={{ padding: 24 }}>
        <p>No seller found. Run seed or create a seller first.</p>
        <Link href="/">← Back Home</Link>
      </main>
    );
  }

  async function updateSeller(formData: FormData) {
    "use server";
    const sellerId = String(formData.get("sellerId") || "");
    const bio = String(formData.get("bio") || "");
    const story = String(formData.get("story") || "");
    const location = String(formData.get("location") || "");

    await prisma.seller.update({
      where: { id: sellerId },
      data: { bio, story, location },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/artisans/${sellerId}`);
  }

  async function createProduct(formData: FormData) {
    "use server";
    const sellerId = String(formData.get("sellerId") || "");
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const price = Number(formData.get("price") || 0); // dollars
    const imageUrl = String(formData.get("imageUrl") || "").trim();

    await prisma.product.create({
      data: {
        sellerId,
        title,
        description,
        category,
        priceCents: Math.round(price * 100),
        imageUrl: imageUrl || null,
    },
 });


    if (!title || !description || !category || !price || price <= 0) {
      // For now return silently. Later it can show errors in UI.
      return;
    }

    await prisma.product.create({
      data: {
        sellerId,
        title,
        description,
        category,
        priceCents: Math.round(price * 100),
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/shop");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") || "");
    const sellerId = String(formData.get("sellerId") || "");

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/shop");
    revalidatePath(`/artisans/${sellerId}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Seller Dashboard</h1>
        <nav aria-label="Dashboard navigation" style={{ display: "flex", gap: 12 }}>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href={`/artisans/${seller.id}`}>My Public Profile</Link>
          <Link href="/dashboard/listings">My Listings</Link>
        </nav>
      </header>

      <p style={{ marginTop: 10, opacity: 0.85 }}>
        Logged in as (demo): <strong>{seller.user.name}</strong>
      </p>

      {/* Edit Profile */}
      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Edit Profile</h2>

        <form action={updateSeller} style={{ display: "grid", gap: 10 }}>
          <input type="hidden" name="sellerId" value={seller.id} />

          <label>
            Location
            <input
              name="location"
              defaultValue={seller.location ?? ""}
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <label>
            Bio
            <textarea
              name="bio"
              defaultValue={seller.bio ?? ""}
              rows={3}
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <label>
            Story
            <textarea
              name="story"
              defaultValue={seller.story ?? ""}
              rows={4}
              style={{ width: "100%", padding: 8 }}
            />
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
          <input type="hidden" name="sellerId" value={seller.id} />

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
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                required
                style={{ width: "100%", padding: 8 }}
              />
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
                    <input type="hidden" name="sellerId" value={seller.id} />
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
