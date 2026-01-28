// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") || undefined;
  const min = searchParams.get("min") ? Number(searchParams.get("min")) : undefined;
  const max = searchParams.get("max") ? Number(searchParams.get("max")) : undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(min !== undefined || max !== undefined
        ? {
            priceCents: {
              ...(min !== undefined ? { gte: min * 100 } : {}),
              ...(max !== undefined ? { lte: max * 100 } : {}),
            },
          }
        : {}),
    },
    include: {
      seller: { include: { user: true } },
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
