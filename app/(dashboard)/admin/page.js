import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return <AdminDashboardClient user={session.user} />;
}
