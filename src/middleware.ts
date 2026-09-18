export { default } from 'next-auth/middleware'

// Protect every route except the login page, NextAuth's own API routes,
// and Next.js internals/static assets. Anything else requires a valid
// session or the request is redirected to /login.
export const config = {
  matcher: [
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
}
