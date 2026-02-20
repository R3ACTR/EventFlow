import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/auth";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const session = await auth();
    const { id } = await params;

    if (!session || (session.user.role !== "admin" && session.user.role !== "organizer")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    const original = await Event.findById(id);

    if (!original) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Only allow cloning if you are the organizer or an admin
    if (session.user.role !== "admin" && original.organizer && original.organizer.toString() !== session.user.id) {
       return NextResponse.json(
        { error: "You can only clone your own events" },
        { status: 403 }
      );
    }

    const cloned = await Event.create({
      title: original.title + " (Copy)",
      description: original.description,
      startDate: original.startDate,
      endDate: original.endDate,
      registrationDeadline: original.registrationDeadline,
      organizer: session.user.id, // Set the current user as the organizer of the clone
      status: "draft",
      rules: original.rules,
      tracks: original.tracks,
    });

    return NextResponse.json(cloned, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Clone failed", details: err.message },
      { status: 500 }
    );
  }
}
