import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { panelRoutes } from "@/config/site";
import { isAllowedEmail, isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Runs only on /panel. Refreshes the Supabase session cookie and sends
 * anyone without an allowed session to the sign-in page.
 *
 * This is the optimistic check. The real ones are in the panel layout, in
 * every server action and, underneath everything, in Postgres RLS.
 */
export async function proxy(request: NextRequest) {
  const isSignIn = request.nextUrl.pathname.startsWith(panelRoutes.signIn);

  // La exportación a Obsidian llega desde tu ordenador con un token en la
  // cabecera, sin cookie. La ruta valida ese token por su cuenta.
  if (request.nextUrl.pathname === panelRoutes.obsidian && request.headers.get("authorization")) {
    const response = NextResponse.next({ request });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (!isSupabaseConfigured()) {
    return isSignIn ? NextResponse.next() : redirectTo(request, panelRoutes.signIn);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getClaims validates the JWT; getSession alone would trust the cookie.
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const allowed = isAllowedEmail(email);

  if (!allowed && !isSignIn) {
    const redirect = redirectTo(request, panelRoutes.signIn);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  if (allowed && isSignIn) {
    return redirectTo(request, panelRoutes.home);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const response = NextResponse.redirect(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/panel", "/panel/:path*"],
};
