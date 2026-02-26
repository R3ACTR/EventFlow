import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

// GET - Fetch FAQs for an event (public)
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Validate ID to prevent CastError
        if (id === "0" || id.length !== 24) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const connected = await dbConnect();
        if (!connected) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
        }

        const event = await Event.findById(id).select("faqs");

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ faqs: event.faqs || [] });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
    }
}

// POST - Add a new FAQ (organizer only)
export async function POST(request, { params }) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check ownership
        if (session.user.role !== "admin" && event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized: You can only edit your own events" }, { status: 403 });
        }

        const body = await request.json();
        const { question, answer, category } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
        }

        const newFaq = {
            question,
            answer,
            category: category || "general"
        };

        event.faqs = event.faqs || [];
        event.faqs.push(newFaq);
        await event.save();

        return NextResponse.json({ 
            message: "FAQ added successfully", 
            faq: newFaq,
            faqs: event.faqs 
        });
    } catch (error) {
        console.error("Error adding FAQ:", error);
        return NextResponse.json({ error: "Failed to add FAQ" }, { status: 500 });
    }
}

// DELETE - Remove a FAQ (organizer only)
export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check ownership
        if (session.user.role !== "admin" && event.organizer.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized: You can only edit your own events" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const faqIndex = searchParams.get("index");

        if (faqIndex === null || faqIndex === undefined) {
            return NextResponse.json({ error: "FAQ index is required" }, { status: 400 });
        }

        const index = parseInt(faqIndex);

        if (isNaN(index) || index < 0 || index >= (event.faqs?.length || 0)) {
            return NextResponse.json({ error: "Invalid FAQ index" }, { status: 400 });
        }

        event.faqs.splice(index, 1);
        await event.save();

        return NextResponse.json({ 
            message: "FAQ deleted successfully", 
            faqs: event.faqs 
        });
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
    }
}
