import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession() instead of getUser() — reads JWT locally, no network call.
  // Actual user validation happens in server components/actions via getUser().
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password";
  const isOnboarding = pathname === "/onboarding";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/check-in") ||
    pathname.startsWith("/diet") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/social") ||
    pathname.startsWith("/challenges") ||
    pathname.startsWith("/battles");

  // Not logged in → redirect to login (for protected routes & onboarding)
  if (!user && (isProtectedRoute || isOnboarding)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Logged in → redirect away from auth pages
    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Onboarding check — use cookie cache to avoid DB query on every dashboard visit
    if (pathname === "/dashboard") {
      const onboardedCookie = request.cookies.get("fq-onboarded");

      if (!onboardedCookie) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding";
          return NextResponse.redirect(url);
        }

        // Cache onboarding status
        if (profile?.onboarding_completed) {
          supabaseResponse.cookies.set("fq-onboarded", "1", {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            sameSite: "lax",
          });
        }
      }
    }
  }

  return supabaseResponse;
}
