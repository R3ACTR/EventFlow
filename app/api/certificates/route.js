import { NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import { auth } from "@/lib/auth";

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

    // Certificate settings (A4 Landscape)
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ✅ IMPORTANT FIX → force built-in font
    doc.font("Helvetica");

    /* =========================
       CERTIFICATE DESIGN (DYNAMIC)
    ========================== */

    const template = event.certificateTemplate;

    // 1. Background
    if (template?.backgroundUrl) {
      try {
        if (template.backgroundUrl.startsWith('http')) {
          const response = await fetch(template.backgroundUrl);
          const buffer = await response.arrayBuffer();
          doc.image(Buffer.from(buffer), 0, 0, { width: 841.89, height: 595.28 });
        } else {
          // Local path
          const fullBgPath = path.join(process.cwd(), 'public', template.backgroundUrl);
          if (fs.existsSync(fullBgPath)) {
            doc.image(fullBgPath, 0, 0, { width: 841.89, height: 595.28 });
          }
        }
      } catch (e) {
        console.error("Error drawing background:", e);
      }
    }

    // 2. Elements
    if (template?.elements && template.elements.length > 0) {
      template.elements.forEach(el => {
        let text = el.content;
        text = text.replace('{{RECIPIENT_NAME}}', recipientName);
        text = text.replace('{{EVENT_TITLE}}', event.title);
        text = text.replace('{{ROLE}}', role);
        text = text.replace('{{DATE}}', new Date().toLocaleDateString());

        doc.fontSize(el.fontSize || 24)
          .fillColor(el.color || '#000000')
          .text(text, el.x, el.y, {
            align: el.align || 'left',
            width: el.align !== 'left' ? 400 : undefined // Give it some width for alignment to work if centered/right
          });
      });
    } else {
      // Fallback to legacy design if no template exists
      doc.fontSize(30).text("Certificate of Participation", 0, 150, { align: "center" });
      doc.moveDown();
      doc.fontSize(18).text("This certificate is proudly presented to", { align: "center" });
      doc.moveDown();
      doc.fontSize(28).text(recipientName, { align: "center" });
      doc.moveDown();
      doc.fontSize(18).text(`for participating in ${event.title}`, { align: "center" });
    }

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
