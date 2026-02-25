import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  if (session.user?.role !== "admin") {
    redirect(`/${session.user?.role || "participant"}`);
  }

  return <AdminDashboardClient user={session.user} />;
}
