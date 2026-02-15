import { NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import Announcement from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/* GET — Fetch active announcements */
export async function GET() {
  try {
    await connectDB();

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
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

/* POST — Create announcement (organizers only) */
export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const announcement = await Announcement.create({
      ...body,
      createdBy: session.user.id,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

/* DELETE — deactivate announcement */
export async function DELETE(req) {
  try {
    await connectDB();

    const { id } = await req.json();

    await Announcement.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
