
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
        const { id } = params;
        const body = await request.json();
        const { score, feedback, criteriaScores } = body;

        // Verify submission exists
        const submission = await Submission.findById(id);
        if (!submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Add or update the judge's evaluation
        const existingEvaluationIndex = submission.evaluations.findIndex(
            (e) => e.judge.toString() === session.user.id
        );

        if (existingEvaluationIndex !== -1) {
            // Update existing
            submission.evaluations[existingEvaluationIndex].score = score;
            submission.evaluations[existingEvaluationIndex].feedback = feedback;
            submission.evaluations[existingEvaluationIndex].evaluatedAt = new Date();
        } else {
            // Add new
            submission.evaluations.push({
                judge: session.user.id,
                score,
                feedback,
                evaluatedAt: new Date(),
            });
        }

        // Recalculate average score
        const totalScore = submission.evaluations.reduce((sum, e) => sum + e.score, 0);
        submission.totalScore = totalScore;
        submission.averageScore = totalScore / submission.evaluations.length;

        // Add judge to judgedBy list if not present
        if (!submission.judgedBy.includes(session.user.id)) {
            submission.judgedBy.push(session.user.id);
        }

        await submission.save();

        return NextResponse.json({ message: "Evaluation submitted successfully", submission });
    } catch (error) {
        console.error("Error submitting evaluation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
