import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
});

const registerSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["admin", "organizer", "participant", "mentor", "judge"]).optional(),
});

export async function POST(request) {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { isRateLimited } = limiter.check(5, ip); // 5 requests per minute per IP

    if (isRateLimited) {
        return NextResponse.json(
            { message: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            console.error("Validation failed:", validation.error.format());
            return NextResponse.json(
                {
                    message: "Invalid input provided",
                    details: validation.error.format(),
                },
                { status: 400 }
            );
        }

        const { name, email, password, role } = validation.data;

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
return NextResponse.json(
  { message: "User already exists" },
  { status: 400 }
);        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user - always default to participant role
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "participant",
        });

        return NextResponse.json(
            { message: "User registered successfully", user: { email: user.email, name: user.name, role: user.role } },
            { status: 201 }
        );
    } catch (error) {
        console.error("REGISTER ERROR FULL:", error);
        return NextResponse.json(
  { message: "Internal server error during registration" },
  { status: 500 }
);
    }

}