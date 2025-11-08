// middleware.ts (in root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Get session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Protected routes
  const protectedPaths = ["/dashboard", "/orders", "/profile", "/checkout"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected route without session, redirect to sign-in
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Auth routes - redirect to dashboard if already logged in
  const authPaths = ["/sign-in", "/sign-up"];
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
