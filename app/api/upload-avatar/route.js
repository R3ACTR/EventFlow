import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/db-connect";
import User from "@/models/User";
import { auth } from "@/auth";
import sharp from "sharp";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // create uploads folder if not exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-avatar.webp`;
    const filepath = path.join(uploadDir, filename);

    // Compress and resize image using sharp
    await sharp(buffer)
      .resize(300, 300, {
        fit: "cover",
        position: "center"
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    const fileUrl = `/uploads/${filename}`;

    // save to DB
    await User.findByIdAndUpdate(session.user.id, {
      avatarUrl: fileUrl,
    });

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}