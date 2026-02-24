import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

// GET - Get teams that need mentors or are available for claiming
export async function GET(request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'available' or 'claimed'

    let query = {};
    
    if (status === 'available') {
      // Teams that have requested mentor help but don't have one yet
      query = { 
        mentorRequested: true,
        assignedMentor: { $exists: false }
      };
    } else if (status === 'claimed') {
      // Teams assigned to this mentor
      query = { assignedMentor: session.user.id };
    } else {
      // All teams that need or have mentors
      query = { 
        $or: [
          { mentorRequested: true },
          { assignedMentor: session.user.id }
        ]
      };
    }

    const teams = await Team.find(query)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate({
        path: 'event',
        select: 'title startDate endDate'
      })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching mentor teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

// POST - Claim a team as mentor
export async function POST(request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await request.json();
    const mentorId = session.user.id;

    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.assignedMentor) {
      return NextResponse.json({ error: "Team already has a mentor" }, { status: 400 });
    }

    team.assignedMentor = mentorId;
    await team.save();

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Error claiming team:", error);
    return NextResponse.json({ error: "Failed to claim team" }, { status: 500 });
  }
}
