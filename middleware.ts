import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/manifest',
    '/about',
    '/news',
    '/news/(.*)',
    '/join',
    '/join/(.*)',
    '/api/webhooks/(.*)',
  ],
  // Routes that should be ignored by the middleware completely
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/webhooks/liqpay',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
