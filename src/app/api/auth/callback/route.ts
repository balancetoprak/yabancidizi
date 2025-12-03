import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IS_DEVELOPMENT } from "@/utils/constants";

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (user) {
        console.info({ user });

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile) {
          const baseUsername =
            user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];

          const generateUniqueUsername = async (base: string) => {
            let username = base;
            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
              const { data: existing } = await supabase
                .from("profiles")
                .select("username")
                .eq("username", username)
                .single();

              if (!existing) {
                return username;
              }

              const randomNum = Math.floor(1000 + Math.random() * 9000);
              username = `${base}#${randomNum}`;
              attempts++;
            }

            return `${base}${Date.now()}`;
          };

          const uniqueUsername = await generateUniqueUsername(baseUsername);

          const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            username: uniqueUsername,
          });

          if (profileError) {
            console.error("Profile creation error:", profileError);
          } else {
            console.log("Profile created with username:", uniqueUsername);
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");

      if (IS_DEVELOPMENT) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=true`);
};
