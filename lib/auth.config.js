
export const authConfig = {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            // Define public routes that don't require authentication
            const publicRoutes = [
                "/",
                "/login",
                "/register",
                "/api/auth",
                "/api/events",
                "/api/teams",
                "/api/announcements",
                "/events",
                "/verify",
            ];

            // Check if the route is public
            const isPublicRoute = publicRoutes.some(route =>
                pathname === route || pathname.startsWith(route + "/")
            );

            // Allow public routes
            if (isPublicRoute) {
                // Redirect logged-in users away from login/register pages
                if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
                    const role = auth.user.role || "participant";
                    return Response.redirect(new URL(`/${role}`, nextUrl));
                }
                return true;
            }

            // Protected routes require authentication
            if (!isLoggedIn) {
                return false; // NextAuth will redirect to signIn page
            }

            // Role-based route protection
            const dashboardRoutes = {
                "/admin": "admin",
                "/organizer": "organizer",
                "/judge": "judge",
                "/mentor": "mentor",
                "/participant": "participant",
            };

            // Check if accessing a dashboard route
            for (const [route, requiredRole] of Object.entries(dashboardRoutes)) {
                if (pathname.startsWith(route) && auth.user.role !== requiredRole) {
                    // Redirect to the appropriate dashboard based on role
                    const redirectUrl = new URL(`/${auth.user.role || "participant"}`, nextUrl);
                    return Response.redirect(redirectUrl);
                }
            }

            return true;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString() || user.id;
                token.role = user.role;
            }
            return token;
        }
    },
    providers: [], // Configured in auth.js
};
