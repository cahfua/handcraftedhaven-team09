// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // category can come in as null, "", or even the string "undefined"
    const rawCategory = searchParams.get("category");
    const category =
      rawCategory && rawCategory !== "undefined" && rawCategory.trim() !== ""
        ? rawCategory.trim()
        : undefined;

    // Convert min/max safely — ignore if NaN
    const rawMin = searchParams.get("min");
    const rawMax = searchParams.get("max");

    const minNum = rawMin && rawMin.trim() !== "" ? Number(rawMin) : undefined;
    const maxNum = rawMax && rawMax.trim() !== "" ? Number(rawMax) : undefined;

    const min = Number.isFinite(minNum) ? minNum : undefined;
    const max = Number.isFinite(maxNum) ? maxNum : undefined;

    // Build price filter if at least one bound is valid
    const priceFilter =
      min !== undefined || max !== undefined
        ? {
            ...(min !== undefined ? { gte: Math.round(min * 100) } : {}),
            ...(max !== undefined ? { lte: Math.round(max * 100) } : {}),
          }
        : undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(priceFilter ? { priceCents: priceFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
