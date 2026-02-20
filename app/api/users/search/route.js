
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "organizer" && session.user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const role = searchParams.get("role");

        const filter = {};

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ];
        }

        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select("_id name email role avatar")
            .limit(10);

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
