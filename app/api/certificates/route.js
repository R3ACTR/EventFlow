import { NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import { auth } from "@/auth";

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || (session.user.role !== "admin" && session.user.role !== "organizer")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { eventId, recipientName, recipientEmail, role } = body;

    // validation
    if (!eventId || !recipientName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Optional: Check if the user is the organizer of the event
    if (session.user.role !== "admin" && event.organizer && event.organizer.toString() !== session.user.id) {
       return NextResponse.json(
        { error: "You are not authorized to generate certificates for this event" },
        { status: 403 }
      );
    }

    /* =========================
       CREATE PDF CERTIFICATE
    ========================== */

    const fileName = `${recipientName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), "public", "certificates", fileName);

    // ensure folder exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // ✅ IMPORTANT FIX → force built-in font
    doc.font("Helvetica");

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    /* =========================
       CERTIFICATE DESIGN
    ========================== */

    doc.fontSize(30).text("Certificate of Participation", { align: "center" });

    doc.moveDown();
    doc.fontSize(18).text(
      "This certificate is proudly presented to",
      { align: "center" }
    );

    doc.moveDown();
    doc.fontSize(28).text(recipientName, { align: "center" });

    doc.moveDown();
    doc.fontSize(18).text(
      `for participating in ${event.title}`,
      { align: "center" }
    );

    doc.moveDown(2);
    doc.fontSize(14).text(`Role: ${role}`, { align: "center" });

    doc.end();

    // wait until file finished writing
    await new Promise((resolve) => stream.on("finish", resolve));

    /* =========================
       SAVE DB RECORD
    ========================== */

    const certificate = await Certificate.create({
      event: eventId,
      recipientName,
      recipientEmail,
      role,
      certificateUrl: `/certificates/${fileName}`,
    });

    return NextResponse.json({
      success: true,
      certificate,
    });

  } catch (error) {
    console.error("CERTIFICATE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
