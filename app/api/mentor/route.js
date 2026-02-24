import { NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

// GET - Fetch mentor's assigned teams and stats
export async function GET(req) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || session.user.role !== "mentor") {
      return NextResponse.json(
        { error: "Unauthorized - Mentor access required" },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Fetch teams assigned to this mentor
    const assignedTeams = await Team.find({ assignedMentor: userId, status: "active" })
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate({
        path: "event",
        select: "title startDate endDate status"
      })
      .sort({ updatedAt: -1 });

    // Fetch teams that have requested mentor help but don't have one yet
    const availableTeams = await Team.find({ 
      mentorRequested: true,
      assignedMentor: { $exists: false },
      status: "active" 
    })
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate({
        path: "event",
        select: "title startDate endDate status"
      })
      .sort({ updatedAt: -1 });

    const teams = [...assignedTeams, ...availableTeams];

    // Get event IDs from teams for submissions query
    const teamIds = teams.map(t => t._id);
    const eventIds = [...new Set(teams.map(t => t.event?._id).filter(Boolean))];

    // Fetch submissions for assigned teams
    const submissions = await Submission.find({ team: { $in: teamIds } })
      .populate("team", "name")
      .populate("event", "title")
      .sort({ createdAt: -1 });

    // Calculate stats
    const pendingSubmissions = submissions.filter(s => !s.status || s.status === "pending").length;
    const reviewedSubmissions = submissions.filter(s => s.status && s.status !== "pending").length;

    // Get events the mentor is assigned to
    const events = await Event.find({ mentors: userId })
      .select("title startDate endDate status")
      .sort({ startDate: -1 });

    // Calculate upcoming meetings (events that haven't ended yet)
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.endDate) > now);

    // Get team progress (based on submissions)
    const teamsWithProgress = teams.map(team => {
      const teamSubmissions = submissions.filter(s => s.team?._id?.toString() === team._id.toString());
      const hasSubmission = teamSubmissions.length > 0;
      
      return {
        ...team.toObject(),
        hasSubmission,
        submissionCount: teamSubmissions.length
      };
    });

    return NextResponse.json({
      success: true,
      teams: teamsWithProgress,
      stats: {
        assignedTeams: teams.length,
        pendingSubmissions,
        reviewedSubmissions,
        upcomingEvents: upcomingEvents.length,
        totalEvents: events.length
      },
      events,
      submissions: submissions.slice(0, 10) // Latest 10 submissions
    });

  } catch (error) {
    console.error("Mentor Dashboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor data" },
      { status: 500 }
    );
  }
}
