import { auth } from "@/auth";
import dbConnect from "@/lib/db-connect";
import Evaluation from "@/models/Evaluation";
import Submission from "@/models/Submission";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { submissionId, scores, feedback } = body;

    if (!submissionId || !scores) {
      return NextResponse.json(
        { error: "Submission ID and scores are required" },
        { status: 400 }
      );
    }

    // Check if submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verify user role - only judges and admins can evaluate
    const userRole = session.user.role;
    if (userRole !== "judge" && userRole !== "admin" && userRole !== "organizer") {
        return NextResponse.json(
            { error: "Only judges can evaluate submissions" },
            { status: 403 }
        );
    }

    // Check if the user has already evaluated this submission
    const existingEvaluation = await Evaluation.findOne({
      submission: submissionId,
      judge: session.user.id,
    });

    if (existingEvaluation) {
      return NextResponse.json(
        { error: "You have already evaluated this submission" },
        { status: 400 }
      );
    }

    const evaluation = await Evaluation.create({
      submission: submissionId,
      judge: session.user.id,
      event: submission.event,
      scores: {
          innovation: Number(scores.innovation),
          execution: Number(scores.execution),
          presentation: Number(scores.presentation),
          impact: Number(scores.impact)
      },
      feedback,
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");
    const eventId = searchParams.get("eventId");

    let query = {};
    if (submissionId) query.submission = submissionId;
    if (eventId) query.event = eventId;

    const evaluations = await Evaluation.find(query)
      .populate("judge", "name email")
      .populate("submission", "title team");

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
