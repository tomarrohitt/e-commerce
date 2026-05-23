import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isServerAction = request.headers.get("Next-Action");
  const isRSCRequest = request.headers.get("RSC");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const shouldSkipRedirect = isServerAction || isRSCRequest || isApiRoute;
  const sessionToken = request.cookies.get("better-auth.session_token");
  const sessionData = request.cookies.get("better-auth.session_data");

  let isValidSession = false;

  if (sessionToken && sessionData) {
    try {
      const jsonString = atob(sessionData.value);
      JSON.parse(jsonString);
      isValidSession = true;
    } catch (error) {
      isValidSession = false;
    }
  }

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

  if (shouldSkipRedirect) {
    const response = NextResponse.next();

    if ((sessionToken || sessionData) && !isValidSession) {
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("better-auth.session_data");
    }

    return response;
  }

  if (isProtectedRoute && !isValidSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);

    const response = NextResponse.redirect(signInUrl);

    if (sessionToken || sessionData) {
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("better-auth.session_data");
    }
    return response;
  }

  if (isAuthRoute && isValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
