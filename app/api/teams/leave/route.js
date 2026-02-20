import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import { auth } from "@/auth";

// LEAVE a team
export async function POST(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamId } = body;
    const userId = session.user.id;
    
    // Validate required fields
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the leader
    if (team.leader.toString() === userId) {
      // If leader is leaving, they can either disband the team or transfer leadership
      // For now, we'll prevent leaders from leaving without transferring
      return NextResponse.json(
        { error: "Team leader cannot leave. Transfer leadership to another member first or disband the team." },
        { status: 400 }
      );
    }
    
    // Check if user is a member
    const memberIndex = team.members.findIndex(m => m.toString() === userId);
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 400 }
      );
    }
    
    // Remove user from team
    team.members.splice(memberIndex, 1);
    await team.save();
    
    return NextResponse.json({ 
      message: "Successfully left the team",
      team 
    });
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json({ error: "Failed to leave team" }, { status: 500 });
  }
}

// DELETE - Disband a team (only by leader)
export async function DELETE(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = session.user.id;
    
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the leader
    if (team.leader.toString() !== userId) {
      return NextResponse.json(
        { error: "Only team leader can disband the team" },
        { status: 403 }
      );
    }
    
    // Delete the team
    await Team.findByIdAndDelete(teamId);
    
    return NextResponse.json({ 
      message: "Team disbanded successfully" 
    });
  } catch (error) {
    console.error("Error disbanding team:", error);
    return NextResponse.json({ error: "Failed to disband team" }, { status: 500 });
  }
}
