
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

async function getUser(email) {
    try {
        await dbConnect();
        const user = await User.findOne({ email }).lean();
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            avatarUrl: user.avatarUrl || "",
                        };
                    }
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
});
