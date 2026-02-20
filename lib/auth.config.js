
export const authConfig = {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
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

            const dashboardRoutes = {
                "/admin": "admin",
                "/organizer": "organizer",
                "/judge": "judge",
                "/mentor": "mentor",
                "/participant": "participant",
            };

            for (const [route, requiredRole] of Object.entries(dashboardRoutes)) {
                if (pathname.startsWith(route) && auth.user.role !== requiredRole) {
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
                session.user.avatarUrl = token.avatarUrl;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString() || user.id;
                token.role = user.role;
                token.avatarUrl = user.avatarUrl || "";
            }
            return token;
        }
    },
    providers: [],
};
