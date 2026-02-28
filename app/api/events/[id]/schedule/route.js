import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

// GET - Fetch schedule for an event
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Validate ID to prevent CastError
        if (id === "0" || id.length !== 24) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const connected = await dbConnect();
        if (!connected) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
        }

        const event = await Event.findById(id).select("schedule");

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Sort schedule by start time
        const schedule = event.schedule ? event.schedule.sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
        ) : [];

        return NextResponse.json({ schedule });
    } catch (error) {
        console.error("Error fetching event schedule:", error);
        return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }
}

// POST - Add a new schedule item
export async function POST(request, { params }) {
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
            return NextResponse.json({ error: "Unauthorized: You can only edit your own events" }, { status: 403 });
        }

        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.startTime || !body.endTime) {
            return NextResponse.json({ error: "Title, start time, and end time are required" }, { status: 400 });
        }

        const newScheduleItem = {
            title: body.title,
            description: body.description || "",
            startTime: body.startTime,
            endTime: body.endTime,
            location: body.location || "",
            type: body.type || "other",
            speaker: body.speaker || { name: "", bio: "", avatar: "" },
            tags: body.tags || []
        };

        event.schedule.push(newScheduleItem);
        await event.save();

        // Return the newly created schedule item
        const addedItem = event.schedule[event.schedule.length - 1];

        return NextResponse.json({ scheduleItem: addedItem, message: "Schedule item added successfully" });
    } catch (error) {
        console.error("Error adding schedule item:", error);
        return NextResponse.json({ error: "Failed to add schedule item" }, { status: 500 });
    }
}

// PUT - Update a schedule item
export async function PUT(request, { params }) {
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
            return NextResponse.json({ error: "Unauthorized: You can only edit your own events" }, { status: 403 });
        }

        const body = await request.json();
        
        if (!body.scheduleItemId) {
            return NextResponse.json({ error: "Schedule item ID is required" }, { status: 400 });
        }

        const scheduleItem = event.schedule.id(body.scheduleItemId);
        
        if (!scheduleItem) {
            return NextResponse.json({ error: "Schedule item not found" }, { status: 404 });
        }

        // Update the schedule item
        if (body.title) scheduleItem.title = body.title;
        if (body.description !== undefined) scheduleItem.description = body.description;
        if (body.startTime) scheduleItem.startTime = body.startTime;
        if (body.endTime) scheduleItem.endTime = body.endTime;
        if (body.location !== undefined) scheduleItem.location = body.location;
        if (body.type) scheduleItem.type = body.type;
        if (body.speaker) scheduleItem.speaker = body.speaker;
        if (body.tags) scheduleItem.tags = body.tags;

        await event.save();

        return NextResponse.json({ scheduleItem, message: "Schedule item updated successfully" });
    } catch (error) {
        console.error("Error updating schedule item:", error);
        return NextResponse.json({ error: "Failed to update schedule item" }, { status: 500 });
    }
}

// DELETE - Remove a schedule item
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
            return NextResponse.json({ error: "Unauthorized: You can only edit your own events" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const scheduleItemId = searchParams.get("itemId");

        if (!scheduleItemId) {
            return NextResponse.json({ error: "Schedule item ID is required" }, { status: 400 });
        }

        const scheduleItem = event.schedule.id(scheduleItemId);
        
        if (!scheduleItem) {
            return NextResponse.json({ error: "Schedule item not found" }, { status: 404 });
        }

        scheduleItem.deleteOne();
        await event.save();

        return NextResponse.json({ message: "Schedule item deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule item:", error);
        return NextResponse.json({ error: "Failed to delete schedule item" }, { status: 500 });
    }
}
