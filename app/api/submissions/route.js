import { NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import Submission from "@/models/Submission";
import Event from "@/models/Event";
import Team from "@/models/Team";
import { auth } from "@/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
});

const submissionSchema = z.object({
    event: z.string().min(1, "Event ID is required"),
    team: z.string().min(1, "Team ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    repoLink: z.string().url("Invalid repository URL"),
    demoLink: z.string().url("Invalid demo URL").optional().or(z.literal("")),
});

export async function POST(req) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { isRateLimited } = limiter.check(10, ip); // 10 requests per minute per IP

    if (isRateLimited) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        await connectDB();
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await req.json();
        const { id, event, team, title, description, repoLink, demoLink } = body;

        // --- UPDATE LOGIC ---
        if (id) {
            const existingSubmission = await Submission.findById(id);
            if (!existingSubmission) {
                return NextResponse.json({ error: "Submission not found" }, { status: 404 });
            }

            // Update fields
            existingSubmission.title = title || existingSubmission.title;
            existingSubmission.description = description || existingSubmission.description;
            existingSubmission.repoLink = repoLink || existingSubmission.repoLink;
            existingSubmission.demoLink = demoLink || existingSubmission.demoLink;

            await existingSubmission.save();

            return NextResponse.json(
                { success: true, submission: existingSubmission },
                { status: 200 }
            );
        }

        // --- CREATE LOGIC ---

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { event, team, title, description, repoLink, demoLink } = validation.data;
        const userId = session.user.id;

        // Check if event exists
        const eventExists = await Event.findById(event);
        if (!eventExists) {
            return NextResponse.json({ error: "Invalid event ID" }, { status: 404 });
        }

        // Check if team exists
        const teamExists = await Team.findById(team);
        if (!teamExists) {
            return NextResponse.json({ error: "Invalid team ID" }, { status: 404 });
        }

        // Check if user is a member of the team
        if (teamExists.leader.toString() !== userId && !teamExists.members.some(m => m.toString() === userId)) {
            return NextResponse.json(
                { error: "You are not a member of this team" },
                { status: 403 }
            );
        }

        // Check for duplicate submission (One per team per event)
        const existingSubmission = await Submission.findOne({ event, team });
        if (existingSubmission) {
            return NextResponse.json(
                { error: "Submission already exists for this team in this event." },
                { status: 409 } // Conflict
            );
        }

        // Create the submission
        const newSubmission = await Submission.create({
            event,
            team,
            title,
            description,
            repoLink,
            demoLink,
        });

        return NextResponse.json(
            { success: true, submission: newSubmission },
            { status: 201 }
        );

    } catch (error) {
        console.error("Submission Create/Update Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}



export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");
        const teamId = searchParams.get("teamId");

        let query = {};
        if (eventId) query.event = eventId;
        if (teamId) query.team = teamId;

        // Populate team details (name) and event details (title)
        const submissions = await Submission.find(query)
            .populate("team", "name")
            .populate("event", "title")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, submissions });

    } catch (error) {
        console.error("Submission Fetch Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
