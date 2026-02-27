import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/watchlist", "/portfolio", "/alerts", "/settings", "/notifications"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("notifinance-auth")?.value;
  if (!authCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/watchlist/:path*", "/portfolio/:path*", "/alerts/:path*", "/settings/:path*", "/notifications/:path*"],
};
