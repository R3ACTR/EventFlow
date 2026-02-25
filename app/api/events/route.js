import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validation";

// GET all events
export async function GET(request) {
  try {
    const session = await auth();
    const connected = await dbConnect();
    if (!connected) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    let query = {};
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    if (userRole === "admin") {
      query = {};
    } else if (userRole === "organizer") {
      const { searchParams } = new URL(request.url);
      const view = searchParams.get("view");
      if (view === "mine") {
        query = { organizer: userId };
      } else {
        query = {
          $or: [
            { isPublic: true, status: { $in: ["upcoming", "ongoing"] } },
            { organizer: userId }
          ]
        };
      }
    } else if (userRole === "judge") {
      query = {
        $or: [
          { isPublic: true, status: { $in: ["upcoming", "ongoing"] } },
          { judges: userId }
        ]
      };
    } else if (userRole === "mentor") {
      query = {
        $or: [
          { isPublic: true, status: { $in: ["upcoming", "ongoing"] } },
          { mentors: userId }
        ]
      };
    } else {
      query = { isPublic: true, status: { $in: ["upcoming", "ongoing"] } };
    }

    // Optimization: Return only necessary fields for list views
    const events = await Event.find(query)
      .select("title description startDate endDate registrationDeadline location status isPublic maxTeamSize organizer")
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

    if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Automated Data Validation with Zod
    const validation = eventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation failed",
        details: validation.error.format()
      }, { status: 400 });
    }

    const validatedData = validation.data;

    const event = await Event.create({
      ...validatedData,
      organizer: session.user.id,
      status: "upcoming"
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

