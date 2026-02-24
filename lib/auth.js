
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import dbConnect from "@/lib/db-connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

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
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
       Credentials({
  async authorize(credentials) {
    const parsedCredentials = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .safeParse(credentials);

    if (!parsedCredentials.success) {
      throw new Error("Invalid email or password");
    }

    const { email, password } = parsedCredentials.data;

    const user = await getUser(email);

    if (!user) {
      throw new Error("User not found");
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      throw new Error("Incorrect password");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || "",
    };
  },
}),
    ],
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            const publicRoutes = ["/", "/login", "/register", "/events", "/verify", "/profile"];
            const isPublicRoute = publicRoutes.includes(pathname);

            if (isPublicRoute) return true;

            // For /profile, check if user is logged in
            if (pathname === "/profile") {
                if (!isLoggedIn) return false;
                return true;
            }

            if (!isLoggedIn) return false;

            const dashboardRoutes = {
                "/admin": "admin",
                "/organizer": "organizer",
                "/judge": "judge",
                "/mentor": "mentor",
                "/participant": "participant",
            };

            const userRole = auth.user.role || "participant";

            for (const [route, requiredRole] of Object.entries(dashboardRoutes)) {
                if (pathname.startsWith(route)) {
                    if (userRole !== requiredRole) {
                        const targetPath = `/${userRole}`;
                        if (pathname === targetPath) return true;

                        const redirectUrl = new URL(targetPath, nextUrl);
                        return Response.redirect(redirectUrl);
                    }
                    return true;
                }
            }

            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                // Initial sign in
                if (account?.provider === "google" || account?.provider === "github") {
                    try {
                        await dbConnect();
                        let dbUser = await User.findOne({ email: user.email });

                        if (!dbUser) {
                            // Create new user for social login
                            dbUser = await User.create({
                                name: user.name,
                                email: user.email,
                                avatarUrl: user.image || user.avatar_url || "",
                                role: "participant",
                            });
                        }

                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                        // Consolidate all possible image sources into one property
                        token.avatarUrl = dbUser.avatarUrl || user.image || "";
                    } catch (error) {
                        console.error("Error syncing social user:", error);
                    }
                } else {
                    // Credentials login
                    token.id = user.id;
                    token.role = user.role;
                    token.avatarUrl = user.avatarUrl || "";
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                // Sync all common image property names for maximum compatibility
                session.user.avatarUrl = token.avatarUrl || token.image || token.picture || "";
                session.user.image = session.user.avatarUrl;
                session.user.picture = session.user.avatarUrl;
            }
            return session;
        },
    },
});
