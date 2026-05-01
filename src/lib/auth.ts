import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'

// Simple password hashing for demo - in production use bcrypt
function simpleHash(password: string): string {
  // For demo purposes only - use bcrypt in production
  return Buffer.from(password).toString('base64')
}

function simpleCompare(password: string, hash: string): boolean {
  return simpleHash(password) === hash
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true, crew: true },
        })

        if (!user) {
          return null
        }

        // For demo, allow plain password comparison or hashed
        const passwordMatch = user.password === credentials.password || 
          simpleCompare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name,
          crewId: user.crewId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.crewId = user.crewId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.crewId = token.crewId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

// Helper to hash passwords
export function hashPassword(password: string): string {
  return simpleHash(password)
}
