// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
//import GitHub from "next-auth/providers/github";
//import { PrismaAdapter } from "@next-auth/prisma-adapter";
//import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

//const handler = NextAuth({
  //debug: true,
  //adapter: PrismaAdapter(prisma),
  //providers: [
    //GitHub({
      //clientId: process.env.GITHUB_CLIENT_ID!,
      //clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    //}),
  //],
  //session: { strategy: "database" },
//});
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
