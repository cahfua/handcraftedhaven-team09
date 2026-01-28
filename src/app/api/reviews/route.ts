// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, userId, rating, comment } = body;

  if (!productId || !userId || !rating || !comment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: { productId, userId, rating, comment },
  });

  return NextResponse.json(review, { status: 201 });
}

