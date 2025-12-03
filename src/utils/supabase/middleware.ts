import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../env";

const PROTECTED_PATHS = env.PROTECTED_PATHS?.split(",") ?? [];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // kullanıcı oturum açmamışsa ve geçerli yol adı korunuyorsa, oturum açma sayfasına yönlendir
  if (!user && PROTECTED_PATHS.some((url) => pathname.startsWith(url))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";

    const redirectRes = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectRes;
  }

  // kullanıcı oturum açmışsa ve geçerli yol adı auth ise ana sayfaya yönlendir
  if (user && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/";

    const redirectRes = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectRes;
  }

  return supabaseResponse;
}
