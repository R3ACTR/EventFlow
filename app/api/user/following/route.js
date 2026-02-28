import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// PUT - Follow or unfollow an event
export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connected = await dbConnect();
    if (!connected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { eventId, action } = await request.json();

    if (!eventId || !action) {
      return NextResponse.json({ error: "Event ID and action are required" }, { status: 400 });
    }

    const userId = session.user.id;
    let user;

    if (action === "follow") {
      // Add event to user's following list (avoid duplicates)
      user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { followingEvents: eventId } },
        { new: true }
      ).populate("followingEvents");
    } else if (action === "unfollow") {
      // Remove event from user's following list
      user = await User.findByIdAndUpdate(
        userId,
        { $pull: { followingEvents: eventId } },
        { new: true }
      ).populate("followingEvents");
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'follow' or 'unfollow'" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = user.followingEvents.some(e => e._id.toString() === eventId);

    return NextResponse.json({ 
      success: true, 
      isFollowing,
      followingCount: user.followingEvents.length
    });
  } catch (error) {
    console.error("Error updating event follow status:", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}

// GET - Get user's following events
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connected = await dbConnect();
    if (!connected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const user = await User.findById(session.user.id)
      .populate({
        path: "followingEvents",
        select: "title description startDate endDate location status logo"
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      followingEvents: user.followingEvents || [] 
    });
  } catch (error) {
    console.error("Error fetching following events:", error);
    return NextResponse.json({ error: "Failed to fetch following events" }, { status: 500 });
  }
}
