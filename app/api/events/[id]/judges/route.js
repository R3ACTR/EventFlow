
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// GET assigned judges for an event
export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findById(id).populate("judges", "name email avatar");
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ judges: event.judges });
    } catch (error) {
        console.error("Error fetching judges:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST add a judge to an event
export async function POST(request, { params }) {
    try {
        const session = await auth();
        // Only organizer or admin can assign judges
        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { judgeId } = body;

        if (!judgeId) {
            return NextResponse.json({ error: "Judge ID is required" }, { status: 400 });
        }

        // Verify user exists and is a judge
        const judge = await User.findById(judgeId);
        if (!judge || judge.role !== "judge") {
            // Optional: Allow converting user to judge role?
            // For now strict check
            return NextResponse.json({ error: "User is not a judge" }, { status: 400 });
        }

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if already assigned
        if (event.judges.includes(judgeId)) {
            return NextResponse.json({ error: "Judge already assigned" }, { status: 400 });
        }

        // Lazy migration: Ensure registrationDeadline exists before saving
        if (!event.registrationDeadline) {
            console.log(`Auto-migrating registrationDeadline for event ${event._id} during judge assignment`);
            event.registrationDeadline = event.startDate || new Date();
        }

        event.judges.push(judgeId);
        await event.save();

        return NextResponse.json({ message: "Judge assigned successfully", judges: event.judges });
    } catch (error) {
        console.error("Error assigning judge:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE remove a judge from an event
export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { judgeId } = body;

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        event.judges = event.judges.filter(j => j.toString() !== judgeId);

        // Lazy migration: Ensure registrationDeadline exists before saving
        if (!event.registrationDeadline) {
            event.registrationDeadline = event.startDate || new Date();
        }

        await event.save();

        return NextResponse.json({ message: "Judge removed successfully" });

    } catch (error) {
        console.error("Error removing judge:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
