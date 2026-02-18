import { auth } from "@/auth";
import JudgeDashboard from "@/components/dashboards/JudgeDashboard";

export default async function Page() {
    const session = await auth();
    return <JudgeDashboard user={session?.user} />;
}
