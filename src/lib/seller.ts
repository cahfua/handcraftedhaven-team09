// src/lib/seller.ts
import { prisma } from "@/lib/prisma";

export async function ensureSellerForUser(userId: string) {
  // Create seller if missing (safe for repeated calls)
  const seller = await prisma.seller.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  // Optional: set user role to SELLER when they enter dashboard
  await prisma.user.update({
    where: { id: userId },
    data: { role: "SELLER" },
  });

  return seller;
}
