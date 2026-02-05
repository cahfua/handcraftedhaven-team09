//src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureSellerForUser } from "@/lib/seller";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/api/auth/signin");

  const userId = (session.user as any).id as string;
  if (!userId) redirect("/api/auth/signin");

  // ensure seller record exists
  await ensureSellerForUser(userId);

  return <>{children}</>;
}

