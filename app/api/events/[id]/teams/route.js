
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        const session = await auth();
        // Allow organizers, admins, and judges to see teams
        // Optionally refine this to only the organizer of the event
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        // Fetch teams for this event
        // Populate leader and members
        const teams = await Team.find({ event: id })
            .populate("leader", "name email avatar")
            .populate("members", "name email avatar")
            .sort({ createdAt: -1 });

        return NextResponse.json({ teams });
    } catch (error) {
        console.error("Error fetching event teams:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
