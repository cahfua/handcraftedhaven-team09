// src/lib/auth.ts
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },

  callbacks: {
    async session({ session, user }) {
      // Add user.id + role into the session object
      (session.user as any).id = user.id;
      (session.user as any).role = (user as any).role;
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

