import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // NOTE: The mobile-app rewrite was removed — it silently redirected all
  // mobile visitors to an external Expo app whenever NEXT_PUBLIC_MOBILE_APP_URL
  // was set, breaking the web app for phone users. The web app is fully
  // responsive now, so mobile users get the same experience.
  return NextResponse.next();
}

// Keep the matcher so this middleware slot stays reserved for future use
// (e.g. auth-protected routes) without affecting API/static assets.
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
