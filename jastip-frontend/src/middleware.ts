import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check the user agent to see if it's a mobile device
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  // If mobile, silently rewrite the URL to serve the Expo mobile app
  if (isMobile) {
    // We use an environment variable so you can set it in Vercel
    const mobileUrl = process.env.NEXT_PUBLIC_MOBILE_APP_URL;
    
    // Only rewrite if the mobile URL is configured
    if (mobileUrl) {
      return NextResponse.rewrite(new URL(`${mobileUrl}${request.nextUrl.pathname}${request.nextUrl.search}`));
    }
  }

  // If desktop, or if mobile URL isn't set yet, continue loading the normal Next.js app
  return NextResponse.next();
}

// Only run this middleware on pages, not images or API routes
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
