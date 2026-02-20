import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import Event from "@/models/Event"; // Ensure Event model is imported as it is populated
import User from "@/models/User"; // Ensure User model is imported for population

// GET a single team by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { teamId } = await params;

        const team = await Team.findById(teamId)
            .populate('leader', 'name email')
            .populate('members', 'name email')
            .populate('event');

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ team });
    } catch (error) {
        console.error("Error fetching team:", error);
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}

// UPDATE a team (e.g., add member, change name)
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { teamId } = await params;
        const body = await request.json();

        // Basic update - can be expanded for more specific logic like "remove member" vs "update name"
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $set: body },
            { new: true }
        )
            .populate('leader', 'name email')
            .populate('members', 'name email')
            .populate('event');

        if (!updatedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ team: updatedTeam });
    } catch (error) {
        console.error("Error updating team:", error);
        return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
    }
}
