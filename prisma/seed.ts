// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@haven.com" },
    update: {},
    create: {
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
          avatarUrl: "",
        },
      },
    },
    include: { seller: true },
  });

  const sellerId = sellerUser.seller!.id;

  await prisma.product.createMany({
    data: [
      {
        sellerId,
        title: "Speckled Ceramic Mug",
        description: "Wheel-thrown mug with a speckled glaze.",
        priceCents: 2800,
        category: "Ceramics",
        imageUrl: "",
      },
      {
        sellerId,
        title: "Woven Cotton Tote",
        description: "Durable handwoven tote bag.",
        priceCents: 3500,
        category: "Textiles",
        imageUrl: "",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
