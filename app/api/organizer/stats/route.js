import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import User from "@/models/User";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session || session.user.role !== 'organizer') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get events created by this organizer
    const events = await Event.find({ organizer: userId });
    const eventIds = events.map(e => e._id);

    // Get teams for these events
    const teams = await Team.find({ event: { $in: eventIds } });
    
    // Get submissions for these events
    const submissions = await Submission.find({ event: { $in: eventIds } });

    // Calculate unique participants (leaders + members)
    const participantIds = new Set();
    teams.forEach(team => {
      participantIds.add(team.leader.toString());
      team.members.forEach(member => {
        participantIds.add(member.toString());
      });
    });

    // Calculate average team size
    const totalMembers = teams.reduce((acc, team) => acc + team.members.length + 1, 0);
    const avgTeamSize = teams.length > 0 ? (totalMembers / teams.length).toFixed(1) : 0;

    // Calculate stats by event
    const eventStats = events.map(event => {
      const eventTeams = teams.filter(t => t.event.toString() === event._id.toString());
      const eventSubmissions = submissions.filter(s => s.event.toString() === event._id.toString());
      
      const eventParticipantIds = new Set();
      eventTeams.forEach(team => {
        eventParticipantIds.add(team.leader.toString());
        team.members.forEach(member => {
          eventParticipantIds.add(member.toString());
        });
      });

      return {
        eventId: event._id,
        eventTitle: event.title,
        teams: eventTeams.length,
        participants: eventParticipantIds.size,
        submissions: eventSubmissions.length
      };
    });

    return NextResponse.json({
      totalEvents: events.length,
      totalParticipants: participantIds.size,
      totalTeams: teams.length,
      totalSubmissions: submissions.length,
      avgTeamSize: parseFloat(avgTeamSize),
      eventStats
    });
  } catch (error) {
    console.error("Error fetching organizer stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
