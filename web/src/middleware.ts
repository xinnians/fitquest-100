import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/check-in/:path*",
    "/diet/:path*",
    "/profile/:path*",
    "/social/:path*",
    "/challenges/:path*",
    "/battles/:path*",
    "/games/:path*",
    "/shop/:path*",
    "/onboarding",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
