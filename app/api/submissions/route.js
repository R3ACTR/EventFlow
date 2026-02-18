import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import Submission from "@/models/Submission";
import Event from "@/models/Event";
import Team from "@/models/Team";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // If judge, return all submissions for active events (simplified for now)
        // Or specific event if query param provided
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");

        let query = {};
        if (eventId) {
            query.event = eventId;
        }

        // Populate event, team, and include team members
        const submissions = await Submission.find(query)
            .populate("event", "title")
            .populate({
                path: "team",
                select: "name leader members",
                populate: { path: "leader members", select: "name email" }
            });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
