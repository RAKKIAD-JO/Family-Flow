import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const jwtSecret = process.env.JWT_SECRET;

const protectedRoutes = ["/dashboard", "/transactions", "/accounts"];
const authRoutes = ["/", "/register"];

async function hasValidSession(request: NextRequest) {
  if (!jwtSecret) {
    return false;
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await hasValidSession(request);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/register",
    "/dashboard/:path*",
    "/transactions/:path*",
    "/accounts/:path*",
  ],
};
