// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Existing data cleared");

  // Create seller user + seller profile
  const sellerUser = await prisma.user.create({
    data: {
      name: "Ava Artisan",
      email: "seller@haven.com",
      password: "hashed-later",
      role: "SELLER",
      seller: {
        create: {
          bio: "Handmade pottery inspired by nature.",
          story:
            "I started crafting ceramics in my garage and fell in love with the process.",
          location: "Austin, TX",
          avatarUrl: ""
        }
      }
    },
    include: { seller: true }
  });

  if (!sellerUser.seller) {
    throw new Error("Seller profile was not created");
  }

  console.log("👩‍🎨 Seller created:", sellerUser.email);

  const sellerId = sellerUser.seller.id;

  // Create products
  await prisma.product.createMany({
    data: [
      {
        sellerId,
        title: "Speckled Ceramic Mug",
        description: "Wheel-thrown mug with a speckled glaze.",
        priceCents: 2800,
        category: "Ceramics",
        imageUrl: ""
      },
      {
        sellerId,
        title: "Woven Cotton Tote",
        description: "Durable handwoven tote bag.",
        priceCents: 3500,
        category: "Textiles",
        imageUrl: ""
      }
    ]
  });

  console.log("🛍️ Products seeded");
  console.log("✅ Database seeding complete");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
