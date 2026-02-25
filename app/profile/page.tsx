import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDashboardClient from "./ProfileDashboardClient";
import dbConnect from "@/lib/db-connect";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();

  // Fetch the full user from the database
  const fullUser = await (User as any).findById(session.user.id).lean();

  if (!fullUser) {
    redirect("/login");
  }

  // Ensure _id and timestamps are strings for client component
  const serializedUser = {
    ...fullUser,
    image: session.user.image || fullUser.image || null,
    _id: fullUser._id.toString(),
    createdAt: fullUser.createdAt ? fullUser.createdAt.toISOString() : null,
    updatedAt: fullUser.updatedAt ? fullUser.updatedAt.toISOString() : null,
  };

  return <ProfileDashboardClient user={serializedUser} />;
}
