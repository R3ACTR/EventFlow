import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        await dbConnect();

        const event = await Event.findById(id).populate("organizer", "name email");

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event });
    } catch (error) {
        console.error("Error fetching event details:", error);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            // In prod, check if session.user.id === event.organizer
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        const currentEvent = await Event.findById(id);
        if (!currentEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check ownership
        if (session.user.role !== "admin" && currentEvent.organizer.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized: You can only edit your own events" }, { status: 403 });
        }

        const event = await Event.findByIdAndUpdate(id, body, { new: true });

        return NextResponse.json({ event });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check ownership
        if (session.user.role !== "admin" && event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized: You can only delete your own events" }, { status: 403 });
        }

        await Event.findByIdAndDelete(id);

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
