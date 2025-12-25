import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// CORS headers for mobile app requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Check if this is a mobile API request (has Authorization header or is to mobile endpoints)
function isMobileApiRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const pathname = request.nextUrl.pathname;

  // Check for Bearer token or mobile-specific endpoints
  return (
    authHeader?.startsWith('Bearer ') ||
    pathname.startsWith('/api/mobile/')
  );
}

// Add CORS headers to response
function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle OPTIONS preflight requests for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // For mobile API requests with Bearer token, skip cookie-based auth
  // The API route will handle authentication via the unified auth wrapper
  if (isMobileApiRequest(request) && pathname.startsWith('/api/')) {
    const response = NextResponse.next({ request });
    return addCorsHeaders(response);
  }

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Admin routes that require admin role
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Auth routes (sign-in, sign-up)
  const authRoutes = ['/sign-in', '/sign-up', '/reset-password'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For admin routes, check if user has admin role
  // Note: This is a basic check. For production, you'd want to check the user's role in the database
  if (isAdminRoute && user) {
    // The actual role check will happen in the admin layout
    // This is just to ensure the user is logged in
  }

  // Add CORS headers to API responses for mobile compatibility
  if (pathname.startsWith('/api/')) {
    return addCorsHeaders(supabaseResponse);
  }

  return supabaseResponse;
}
