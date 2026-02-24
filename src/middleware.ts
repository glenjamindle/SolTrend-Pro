import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  // Protect the home page but allow login page and auth API routes
  matcher: ['/', '/dashboard/:path*', '/project/:path*'],
}
