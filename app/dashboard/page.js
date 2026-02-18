import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const role = session.user?.role || "participant";

    // Redirect to role-specific dashboard
    // Currently assuming routes are /judge, /admin, etc. based on (dashboard) group
    if (role === "judge") redirect("/judge");
    if (role === "admin") redirect("/admin");
    if (role === "mentor") redirect("/mentor");
    if (role === "participant") redirect("/participant");

    // Fallback
    redirect("/");
}
