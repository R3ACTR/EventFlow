import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import Score from "@/models/Score";
import Submission from "@/models/Submission";
import User from "@/models/User";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session?.user?.role !== "judge") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        await dbConnect();

        const { submissionId, criteria, feedback } = await req.json();

        // Calculate total score
        const { innovation, execution, presentation, impact } = criteria;
        const totalScore = innovation + execution + presentation + impact;

        // Check if already scored
        const existingScore = await Score.findOne({
            submission: submissionId,
            judge: session.user.id,
        });

        if (existingScore) {
            return NextResponse.json(
                { error: "You have already graded this submission" },
                { status: 400 }
            );
        }

        const score = await Score.create({
            submission: submissionId,
            judge: session.user.id,
            criteria,
            totalScore,
            feedback,
        });

        return NextResponse.json(score, { status: 201 });
    } catch (error) {
        console.error("Error submitting score:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const submissionId = searchParams.get("submissionId");
        const judgeId = searchParams.get("judgeId");

        let query = {};
        if (submissionId) query.submission = submissionId;
        if (judgeId) query.judge = judgeId;

        // If user is a judge, they can see their own scores. 
        // If admin, they can see all.
        if (session.user.role === "judge" && !judgeId) {
            query.judge = session.user.id;
        }

        const scores = await Score.find(query)
            .populate("judge", "name email")
            .populate("submission", "title");

        return NextResponse.json(scores);
    } catch (error) {
        console.error("Error fetching scores:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
