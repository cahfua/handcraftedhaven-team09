// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, rating, comment } = body as {
    productId?: string;
    rating?: number;
    comment?: string;
  };

  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Optional: verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId, // comes from session, guaranteed valid
      rating,
      comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}


