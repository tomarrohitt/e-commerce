import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. IDENTIFY BACKGROUND REQUESTS
  // These headers indicate the request is for Data (JSON), not HTML.
  // If we redirect these to an HTML page, the app crashes.
  const isServerAction = request.headers.get("Next-Action");
  const isRSCRequest = request.headers.get("RSC");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // This boolean determines if we should SKIP all redirect logic
  const shouldSkipRedirect = isServerAction || isRSCRequest || isApiRoute;

  // 2. CHECK COOKIE VALIDITY
  const sessionToken = request.cookies.get("better-auth.session_token");
  const sessionData = request.cookies.get("better-auth.session_data");

  let isValidSession = false;

  if (sessionToken && sessionData) {
    try {
      // Validate that the cookie isn't garbage
      const jsonString = atob(sessionData.value);
      JSON.parse(jsonString);
      isValidSession = true;
    } catch (error) {
      isValidSession = false;
    }
  }

  // 3. DEFINE PATHS
  const protectedPaths = [
    "/dashboard",
    "/orders",
    "/profile",
    "/checkout",
    "/cart",
    "/addresses",
    "/orders/:id",
  ];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  const authPaths = [
    "/sign-in",
    "/sign-up",
    "/email-verification",
    "/reset-password",
  ];
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // ==================================================================
  // PATH A: BACKGROUND REQUESTS (NO REDIRECTS ALLOWED)
  // ==================================================================
  if (shouldSkipRedirect) {
    const response = NextResponse.next();

    // Even though we don't redirect, we MUST clean up the garbage.
    // The browser will delete the cookie in the background.
    if ((sessionToken || sessionData) && !isValidSession) {
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("better-auth.session_data");
    }

    return response;
  }

  // ==================================================================
  // PATH B: STANDARD NAVIGATION (REDIRECTS OK)
  // ==================================================================

  // Scenario: Protected Route + Invalid/Garbage Session
  if (isProtectedRoute && !isValidSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);

    const response = NextResponse.redirect(signInUrl);

    // Kill the zombie cookies so the next load is clean
    if (sessionToken || sessionData) {
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("better-auth.session_data");
    }
    return response;
  }

  // Scenario: Auth Route + Valid Session
  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Scenario: Auth Route + Garbage Session (Cleanup)
  if (isAuthRoute && (sessionToken || sessionData) && !isValidSession) {
    const response = NextResponse.next();
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("better-auth.session_data");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
