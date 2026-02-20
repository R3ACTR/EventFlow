import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Team from "@/models/Team";
import User from "@/models/User";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";

// GET all teams
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // If no userId in query params, try to get from session
    if (!userId) {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    let query = {};
    if (userId) {
      // Find teams where user is leader or member
      query = {
        $or: [
          { leader: userId },
          { members: userId }
        ]
      };
    }

    const teams = await Team.find(query)
      .populate('leader', 'name email role')
      .populate('members', 'name email role')
      .populate('event', 'title startDate endDate description')
      .sort({ createdAt: -1 });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

// CREATE a new team
export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { isRateLimited } = limiter.check(5, ip); // 5 requests per minute per IP

  if (isRateLimited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    let { name, description, eventId, leaderId, inviteCode, maxMembers } = body;

    // If no eventId is provided, find the latest active event
    if (!eventId) {
      const latestEvent = await mongoose.models.Event.findOne({
        endDate: { $gte: new Date() }
      }).sort({ startDate: 1 });

      if (latestEvent) {
        eventId = latestEvent._id;
      } else {
        // Fallback to any event if no active ones
        const anyEvent = await mongoose.models.Event.findOne().sort({ createdAt: -1 });
        if (anyEvent) eventId = anyEvent._id;
      }
    }

    if (!eventId) {
      return NextResponse.json(
        { error: "No active event found to join" },
        { status: 400 }
      );
    }

    // Check if user already has a team
    // Check if user already has a team FOR THIS SPECIFIC EVENT
    const existingTeam = await Team.findOne({
      event: eventId,
      $or: [
        { leader: leaderId },
        { members: leaderId }
      ]
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "You are already in a team for this event" },
        { status: 400 }
      );
    }

    // Generate unique invite code
    const generatedInviteCode = inviteCode || Math.random().toString(36).substring(2, 10).toUpperCase();

    const team = await Team.create({
      name: name,
      description: description || "",
      event: eventId,
      leader: leaderId,
      members: [leaderId],
      inviteCode: generatedInviteCode,
      maxMembers: maxMembers || 4, // Default max size
      status: "active",
      isVerified: false
    });

    await team.populate('leader', 'name email');
    await team.populate('event', 'title startDate endDate');

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error creating team:", error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Team with this name already exists for this event" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

