// NextAuth Configuration for SolTrend Pro
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!passwordMatch) {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name || null,
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string | null
        session.user.companyName = token.companyName as string | null
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    id: string
    role: string
    companyId: string | null
    companyName: string | null
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      companyId: string | null
      companyName: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    companyId: string | null
    companyName: string | null
  }
}
