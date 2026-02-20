import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDashboardClient from "./ProfileDashboardClient";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return <ProfileDashboardClient user={session.user} />;
}
