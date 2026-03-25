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

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const reqError = searchParams.get("error");

    if (reqError) {
      return redirect(siteUrl, "line_denied", reqError);
    }
    if (!code || !state) {
      return redirect(siteUrl, "line_missing_params");
    }

    // Verify CSRF state
    const cookieStore = await cookies();
    const savedState = cookieStore.get("line_oauth_state")?.value;
    if (state !== savedState) {
      return redirect(siteUrl, "line_invalid_state");
    }

    // ── Step 1: Exchange code for LINE tokens ──
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${siteUrl}/api/auth/line/callback`,
        client_id: process.env.LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return redirect(siteUrl, "line_token_failed", body);
    }
    const tokenData = await tokenRes.json();

    // ── Step 2: Get LINE profile ──
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profileRes.ok) {
      return redirect(siteUrl, "line_profile_failed");
    }

    const lineProfile = await profileRes.json();
    const lineUserId: string = lineProfile.userId;
    const displayName: string = lineProfile.displayName;
    const pictureUrl: string | undefined = lineProfile.pictureUrl;

    // Parse email from ID token (optional)
    let email: string | null = null;
    if (tokenData.id_token) {
      try {
        const payload = JSON.parse(
          Buffer.from(tokenData.id_token.split(".")[1], "base64").toString()
        );
        email = payload.email ?? null;
      } catch { /* ignore */ }
    }

    let userEmail = email || `line.${lineUserId}@fitquest.app`;
    const userPassword = `LP_${lineUserId}_${process.env.LINE_CHANNEL_SECRET!.slice(0, 8)}`;

    // ── Step 3: Find or create user ──
    let userId = "" as string;

    // 3a: Check by line_user_id in profiles
    const { data: profileByLine } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("line_user_id", lineUserId)
      .maybeSingle();

    if (profileByLine) {
      userId = profileByLine.id;
      const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: userPassword });
      if (pwError) {
        return redirect(siteUrl, "line_password_update_failed", pwError.message);
      }
      // Get actual email from auth.users (may differ from LINE response)
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUser?.user?.email) {
        userEmail = authUser.user.email;
      }
    }

    // 3b: Check by email in profiles (user might exist from previous attempt without line_user_id)
    if (userId === "") {
      const { data: profileByEmail } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .maybeSingle();

      if (profileByEmail) {
        userId = profileByEmail.id;
        const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: userPassword });
        if (pwError) {
          return redirect(siteUrl, "line_password_update_failed", pwError.message);
        }
        // Get actual email from auth.users (may differ from profiles table)
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authUser?.user?.email) {
          userEmail = authUser.user.email;
        }
        await supabaseAdmin
          .from("profiles")
          .update({ line_user_id: lineUserId, nickname: displayName, avatar_url: pictureUrl || null })
          .eq("id", userId);
      }
    }

    // 3c: Create new user if not found
    if (userId === "") {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: { name: displayName, avatar_url: pictureUrl, provider: "line" },
      });

      if (createError) {
        // User exists in auth.users but wasn't found via profiles lookup
        // Find existing auth user and link LINE identity
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData?.users?.find((u) => u.email === userEmail);
        if (existingUser) {
          userId = existingUser.id;
          const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: userPassword });
          if (pwError) {
            return redirect(siteUrl, "line_password_update_failed", pwError.message);
          }
          userEmail = existingUser.email!;
          // Sync profile with LINE data
          await supabaseAdmin
            .from("profiles")
            .upsert(
              { id: userId, email: userEmail, line_user_id: lineUserId, nickname: displayName, avatar_url: pictureUrl || null },
              { onConflict: "id" }
            );
        } else {
          return redirect(siteUrl, "line_create_failed", createError.message);
        }
      } else if (!newUser.user) {
        return redirect(siteUrl, "line_create_failed", "createUser returned null");
      } else {
        userId = newUser.user.id;
        await supabaseAdmin
          .from("profiles")
          .update({ line_user_id: lineUserId, nickname: displayName, avatar_url: pictureUrl || null })
          .eq("id", userId);
      }
    }

    // ── Step 4: Sign in and set session cookies ──
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
      return redirect(siteUrl, "line_session_failed", signInError.message);
    }

    response.cookies.delete("line_oauth_state");
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return redirect(siteUrl, "line_unexpected", msg);
  }
}

function redirect(siteUrl: string, error: string, detail?: string) {
  const params = new URLSearchParams({ error });
  if (detail) params.set("detail", detail);
  return NextResponse.redirect(`${siteUrl}/login?${params.toString()}`);
}
