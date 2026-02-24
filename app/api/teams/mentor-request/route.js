import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import { auth } from "@/lib/auth";

// PUT - Request mentor help for a team
export async function PUT(request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { teamId, message } = await request.json();

    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is team leader or member
    const isLeader = team.leader.toString() === userId;
    const isMember = team.members.some(m => m.toString() === userId);
    
    if (!isLeader && !isMember) {
      return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });
    }

    team.mentorRequested = true;
    team.mentorRequestMessage = message || "We would love some mentor guidance!";
    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Error requesting mentor:", error);
    return NextResponse.json({ error: "Failed to request mentor" }, { status: 500 });
  }
}

// DELETE - Cancel mentor request
export async function DELETE(request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { teamId } = await request.json();

    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is team leader
    if (team.leader.toString() !== userId) {
      return NextResponse.json({ error: "Only team leader can cancel mentor request" }, { status: 403 });
    }

    // Only allow cancellation if no mentor is assigned
    if (team.assignedMentor) {
      return NextResponse.json({ error: "Cannot cancel - mentor already assigned" }, { status: 400 });
    }

    team.mentorRequested = false;
    team.mentorRequestMessage = null;
    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Error canceling mentor request:", error);
    return NextResponse.json({ error: "Failed to cancel request" }, { status: 500 });
  }
}
