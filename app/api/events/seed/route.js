import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/auth";

const demoEvents = [
  {
    title: "Hackathon 2026",
    description: "Join us for the biggest hackathon of the year! Build innovative solutions and win amazing prizes.",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-15"),
    registrationDeadline: new Date("2026-02-28"),
    status: "upcoming",
    rules: [
      "Teams of 2-5 members",
      "Open to all skill levels",
      "Must use provided API",
      "Submit before deadline"
    ],
    tracks: ["AI/ML", "Web Development", "Mobile Apps", "Blockchain"]
  },
  {
    title: "Code Sprint 2026",
    description: "A 48-hour coding sprint to build impactful projects for social good.",
    startDate: new Date("2026-04-10"),
    endDate: new Date("2026-04-12"),
    registrationDeadline: new Date("2026-04-08"),
    status: "upcoming",
    rules: [
      "Teams of 3-4 members",
      "Theme: Social Impact",
      "Open source projects welcome"
    ],
    tracks: ["Social Impact", "Sustainability", "Education", "Healthcare"]
  },
  {
    title: "AI Innovation Challenge",
    description: "Push the boundaries of AI with cutting-edge machine learning solutions.",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-31"),
    registrationDeadline: new Date("2026-04-25"),
    status: "upcoming",
    rules: [
      "Individual or teams up to 3",
      "Must use AI/ML technologies",
      "Demo video required"
    ],
    tracks: ["Computer Vision", "NLP", "Generative AI", "Robotics"]
  }
];

// SEED demo events
export async function POST() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    // Check if events already exist
    const existingCount = await Event.countDocuments();
    if (existingCount > 0) {
      // Clear existing events first
      await Event.deleteMany({});
    }
    
    // Create demo events
    // Add organizer if possible, defaulting to the admin running the seed
    const eventsWithOrganizer = demoEvents.map(event => ({
      ...event,
      organizer: session.user.id
    }));

    const createdEvents = await Event.insertMany(eventsWithOrganizer);
    
    return NextResponse.json({ 
      message: `Created ${createdEvents.length} demo events`,
      events: createdEvents
    }, { status: 201 });
  } catch (error) {
    console.error("Error seeding events:", error);
    return NextResponse.json(
      { error: "Failed to seed events" },
      { status: 500 }
    );
  }
}

