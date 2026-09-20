export { default } from 'next-auth/middleware'

// Protect every route except the login page, NextAuth's own API routes,
// the one-time bootstrap seed route, and Next.js internals/static assets.
// Anything else requires a valid session or the request is redirected to
// /login.
//
// /api/seed must stay excluded: on a brand-new (or freshly reset) database
// there are zero users, so nothing can authenticate, and if this route were
// gated by auth there would be no way to ever create the first users. The
// route itself is idempotent and only creates default/demo records, so it's
// safe to leave reachable without a session.
export const config = {
  matcher: [
    '/((?!api/auth|api/seed|login|_next/static|_next/image|favicon.ico).*)',
  ],
}
