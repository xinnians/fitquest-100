import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
    cookieStore.delete("line_oauth_state");

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

    // Try to get email from ID token (LINE may not always provide it)
    let email: string | null = null;
    if (tokenData.id_token) {
      try {
        const payload = JSON.parse(
          Buffer.from(tokenData.id_token.split(".")[1], "base64").toString()
        );
        email = payload.email ?? null;
      } catch {
        // ID token parsing failed, continue without email
      }
    }

    // Check if LINE user already exists in our profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("line_user_id", lineUserId)
      .single();

    let userId: string;

    if (existingProfile) {
      // Existing user — sign them in
      userId = existingProfile.id;
    } else {
      // New user — create Supabase auth user
      const userEmail = email || `line_${lineUserId}@fitquest.local`;
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          name: displayName,
          avatar_url: pictureUrl,
          provider: "line",
          line_user_id: lineUserId,
        },
      });

      if (createError || !newUser.user) {
        // If email already exists, try to link LINE to existing account
        if (createError?.message?.includes("already been registered")) {
          const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
          const matchedUser = existingUser?.users?.find((u) => u.email === userEmail);
          if (matchedUser) {
            userId = matchedUser.id;
            // Update profile with LINE info
            await supabaseAdmin
              .from("profiles")
              .update({
                line_user_id: lineUserId,
                avatar_url: pictureUrl || undefined,
              })
              .eq("id", userId);
          } else {
            return NextResponse.redirect(`${siteUrl}/login?error=line_create_failed`);
          }
        } else {
          return NextResponse.redirect(`${siteUrl}/login?error=line_create_failed`);
        }
      } else {
        userId = newUser.user.id;
        // Update the auto-created profile with LINE info
        await supabaseAdmin
          .from("profiles")
          .update({
            line_user_id: lineUserId,
            nickname: displayName,
            avatar_url: pictureUrl || null,
          })
          .eq("id", userId);
      }
    }

    // Generate a magic link to sign the user in
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: (await supabaseAdmin.auth.admin.getUserById(userId)).data.user?.email || "",
      options: {
        redirectTo: `${siteUrl}/dashboard`,
      },
    });

    if (linkError || !linkData) {
      return NextResponse.redirect(`${siteUrl}/login?error=line_session_failed`);
    }

    // Extract the token from the magic link and redirect to auth/confirm
    const linkUrl = new URL(linkData.properties.action_link);
    const tokenHash = linkUrl.searchParams.get("token_hash") || linkUrl.hash;

    // Redirect to Supabase's verify endpoint to establish session
    const verifyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${linkData.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${siteUrl}/dashboard`)}`;

    return NextResponse.redirect(verifyUrl);
  } catch {
    return NextResponse.redirect(`${siteUrl}/login?error=line_unexpected`);
  }
}
