
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import Submission from "@/models/Submission";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        // Check if user is a judge (or admin)
        if (!session || (session.user.role !== "judge" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const score = session.user.id;

        // 1. Find events where this user is assigned as a judge
        const events = await Event.find({ judges: session.user.id });
        const eventIds = events.map(e => e._id);

        // 2. Find submissions for these events
        // Populate team details for display
        const submissions = await Submission.find({
            event: { $in: eventIds },
            status: { $in: ["pending", "accepted"] } // Maybe judge only accepted ones? Or all? Let's say all submitted ones which are usually "pending" or "accepted"
        }).populate("team", "name members").populate("event", "title");

        // 3. Separate into pending and completed for this specific judge
        const pending = [];
        const completed = [];

        submissions.forEach(sub => {
            const evaluation = sub.evaluations.find(e => e.judge.toString() === session.user.id);

            const formattedSub = {
                id: sub._id,
                teamName: sub.team?.name || "Unknown Team",
                projectName: sub.title,
                event: sub.event?.title,
                submittedAt: sub.submittedAt,
                members: sub.team?.members?.length || 0,
                description: sub.description,
                repoLink: sub.repoLink,
                demoLink: sub.demoLink,
                status: sub.status // Global status
            };

            if (evaluation) {
                completed.push({
                    ...formattedSub,
                    score: evaluation.score,
                    evaluatedAt: evaluation.evaluatedAt,
                    feedback: evaluation.feedback,
                    criteriaScores: evaluation.criteriaScores
                });
            } else {
                pending.push(formattedSub);
            }
        });

        return NextResponse.json({ pending, completed });
    } catch (error) {
        console.error("Error fetching judge submissions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
