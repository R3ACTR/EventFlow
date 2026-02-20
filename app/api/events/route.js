import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

// GET all events
export async function GET(request) {
  try {
    const session = await auth();
    await dbConnect();

    // Default: Public upcoming/ongoing events
    let query = { isPublic: true, status: { $in: ["upcoming", "ongoing"] } };

    if (session?.user) {
      const { role, id } = session.user;
      const { searchParams } = new URL(request.url);
      const view = searchParams.get("view"); // e.g., 'mine' for organizers

      if (role === "admin") {
        query = {}; // Admin sees all
      } else if (role === "organizer") {
        if (view === "mine") {
          query = { organizer: id };
        } else {
          // Organizer sees their events OR public events
          query = {
            $or: [
              { isPublic: true, status: { $in: ["upcoming", "ongoing"] } },
              { organizer: id }
            ]
          };
        }
      } else if (role === "judge") {
        // Judges see public events OR events they are assigned to
        query = {
          $or: [
            { isPublic: true, status: { $in: ["upcoming", "ongoing"] } },
            { judges: id }
          ]
        };
      } else if (role === "mentor") {
        // Mentors see public events OR events they are assigned to
        query = {
          $or: [
            { isPublic: true, status: { $in: ["upcoming", "ongoing"] } },
            { mentors: id }
          ]
        };
      }
      // Add other roles logic if needed
    }

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort({ startDate: 1 });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// CREATE event
export async function POST(request) {
  try {
    const session = await auth();

    // Authorization check
    if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Destructure all possible fields
    const {
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      minTeamSize,
      maxTeamSize,
      tracks,
      rules,
      judges,
      mentors,
      isPublic
    } = body;

    // Basic validation
    if (!title || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json({ error: "Missing required fields (title, startDate, endDate, registrationDeadline)" }, { status: 400 });
    }

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      organizer: session.user.id,
      minTeamSize: minTeamSize || 2,
      maxTeamSize: maxTeamSize || 4,
      tracks: tracks || [],
      rules: rules || [],
      judges: judges || [],
      mentors: mentors || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      status: "upcoming"
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
