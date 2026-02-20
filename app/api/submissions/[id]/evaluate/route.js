
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Submission from "@/models/Submission";
import { auth } from "@/lib/auth";

export async function POST(request, { params }) {
    try {
        const session = await auth();
        // Check if user is a judge
        if (!session || session.user.role !== "judge") {
            return NextResponse.json({ error: "Unauthorized: Judges only" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { score, feedback, criteriaScores } = body;

        // Verify query
        const submission = await Submission.findById(id);
        if (!submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Check if judge has already evaluated
        const existingEvaluation = submission.evaluations.find(
            (e) => e.judge.toString() === session.user.id
        );

        if (existingEvaluation) {
            return NextResponse.json({ error: "You have already evaluated this submission." }, { status: 400 });
        }

        // Add new evaluation
        submission.evaluations.push({
            judge: session.user.id,
            score,
            feedback,
            criteriaScores,
            evaluatedAt: new Date(),
        });

        // Add judge to judgedBy list if not present
        if (!submission.judgedBy.includes(session.user.id)) {
            submission.judgedBy.push(session.user.id);
        }

        // Recalculate average score
        const totalEvaluations = submission.evaluations.length;
        const totalScore = submission.evaluations.reduce((sum, e) => sum + e.score, 0);
        submission.totalScore = totalScore;
        submission.averageScore = totalEvaluations > 0 ? totalScore / totalEvaluations : 0;

        await submission.save();

        return NextResponse.json({ message: "Evaluation submitted successfully", submission });
    } catch (error) {
        console.error("Error submitting evaluation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
