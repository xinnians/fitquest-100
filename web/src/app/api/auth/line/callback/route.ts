import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_missing_params`);
    }

    // Verify state
    const cookieStore = await cookies();
    const savedState = cookieStore.get("line_oauth_state")?.value;
    if (state !== savedState) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_invalid_state`);
    }

    // Exchange code for tokens
    const redirectUri = `${siteUrl}/api/auth/line/callback`;
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_token_failed`);
    }

    const tokenData = await tokenRes.json();

    // Get LINE user profile
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_profile_failed`);
    }

    const lineProfile = await profileRes.json();
    const lineUserId = lineProfile.userId as string;
    const displayName = lineProfile.displayName as string;
    const pictureUrl = lineProfile.pictureUrl as string | undefined;

    // Try to get email from ID token
    let email: string | null = null;
    if (tokenData.id_token) {
      try {
        const payload = JSON.parse(
          Buffer.from(tokenData.id_token.split(".")[1], "base64").toString()
        );
        email = payload.email ?? null;
      } catch {
        // continue without email
      }
    }

    // Check if LINE user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("line_user_id", lineUserId)
      .single();

    let userId: string;
    const userEmail = email || `line_${lineUserId}@fitquest.local`;
    // Use a deterministic password derived from LINE user ID + secret
    const userPassword = `line_${lineUserId}_${process.env.LINE_CHANNEL_SECRET}`;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create new user with email + password
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          name: displayName,
          avatar_url: pictureUrl,
          provider: "line",
        },
      });

      if (createError || !newUser.user) {
        // Email might already exist — try to update with LINE info
        if (createError?.message?.includes("already")) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const matched = users?.users?.find((u) => u.email === userEmail);
          if (matched) {
            userId = matched.id;
            // Set the password so we can sign in
            await supabaseAdmin.auth.admin.updateUserById(userId, { password: userPassword });
          } else {
            return NextResponse.redirect(`${siteUrl}/login?error=line_create_failed`);
          }
        } else {
          return NextResponse.redirect(`${siteUrl}/login?error=line_create_failed`);
        }
      } else {
        userId = newUser.user.id;
      }

      // Update profile with LINE info
      await supabaseAdmin
        .from("profiles")
        .update({
          line_user_id: lineUserId,
          nickname: displayName,
          avatar_url: pictureUrl || null,
        })
        .eq("id", userId);
    }

    // Sign in using SSR client (sets session cookies properly)
    const response = NextResponse.redirect(`${siteUrl}/dashboard`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    if (signInError) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_session_failed`);
    }

    // Clean up state cookie
    response.cookies.delete("line_oauth_state");

    return response;
  } catch {
    return NextResponse.redirect(`${siteUrl}/login?error=line_unexpected`);
  }
}
