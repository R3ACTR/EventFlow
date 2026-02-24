import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get teams where user is leader or member
    const teams = await Team.find({
      $or: [
        { leader: userId },
        { members: userId }
      ]
    })
    .populate('leader', 'name email')
    .populate('members', 'name email')
    .populate({
      path: 'event',
      select: 'title startDate endDate registrationDeadline status'
    })
    .populate('assignedMentor', 'name email')
    .sort({ createdAt: -1 });

    // Get submissions for these teams
    const teamIds = teams.map(t => t._id);
    const submissions = await Submission.find({
      team: { $in: teamIds }
    })
    .populate('event', 'title registrationDeadline endDate')
    .populate('team', 'name')
    .sort({ submittedAt: -1 });

    // Get available events for user to join
    const events = await Event.find({
      status: { $in: ['upcoming', 'ongoing'] },
      isPublic: true
    })
    .select('title description startDate endDate registrationDeadline status')
    .sort({ startDate: 1 })
    .limit(10);

    return NextResponse.json({
      teams,
      submissions,
      availableEvents: events
    });
  } catch (error) {
    console.error("Error fetching participant data:", error);
    return NextResponse.json({ error: "Failed to fetch participant data" }, { status: 500 });
  }
}
