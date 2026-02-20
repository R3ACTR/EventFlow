import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Announcement from "@/models/Announcement";
import { auth } from "@/lib/auth";

/* GET — Fetch active announcements */
export async function GET() {
  try {
    await dbConnect();

    // Fetch active announcements that haven't expired
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

/* POST — Create announcement (organizers only) */
export async function POST(req) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || (session.user.role !== "admin" && session.user.role !== "organizer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validation = announcementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const announcement = await Announcement.create({
      ...validation.data,
      createdBy: session.user.id,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

/* DELETE — deactivate announcement */
export async function DELETE(req) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || (session.user.role !== "admin" && session.user.role !== "organizer")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await Announcement.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
