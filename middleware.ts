import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-in-production");

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/profile",
        "/api/events",
        "/api/teams",
 "/api/announcements",
    ];

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith("/api/auth") && !pathname.includes("/dashboard")
    );

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Skip middleware for static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/public")
    ) {
        return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify the token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const decoded = payload as { userId: string; email: string; role: string };
        
        // Role-based route protection
        const dashboardRoutes = {
            "/admin": "admin",
            "/judge": "judge",
            "/mentor": "mentor",
            "/participant": "participant",
        };

        // Check if accessing a dashboard route
        for (const [route, requiredRole] of Object.entries(dashboardRoutes)) {
            if (pathname.startsWith(route) && decoded.role !== requiredRole) {
                // Redirect to the appropriate dashboard based on role
                const redirectUrl = new URL(`/${decoded.role}`, request.url);
                return NextResponse.redirect(redirectUrl);
            }
        }

        // Add user info to headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", decoded.userId);
        requestHeaders.set("x-user-email", decoded.email);
        requestHeaders.set("x-user-role", decoded.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        // Token is invalid, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
