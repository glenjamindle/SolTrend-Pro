import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

// Every password in this app - the demo seed accounts included - was
// stored as plain text until this change (the "hash" below is real now;
// there used to be a base64 stand-in here, which was never actually
// applied to anything either - see /api/seed and the old settings route).
// A bcrypt hash always starts with one of these prefixes, so it doubles as
// a cheap way to tell an already-migrated password from a legacy one.
const BCRYPT_HASH_RE = /^\$2[aby]\$/

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
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

        // Everyone's password used to be stored as plain text, so an
        // account created before this change won't have a bcrypt hash yet.
        // Rather than forcing every existing user through a manual reset,
        // a legacy account is checked against its plain-text value once
        // here and, on a match, silently re-saved as a real bcrypt hash -
        // this branch never fires again for that user afterward. New
        // accounts (created via hashPassword) always take the bcrypt path.
        let passwordMatch: boolean
        if (BCRYPT_HASH_RE.test(user.password)) {
          passwordMatch = bcrypt.compareSync(credentials.password, user.password)
        } else {
          passwordMatch = user.password === credentials.password
          if (passwordMatch) {
            await prisma.user.update({
              where: { id: user.id },
              data: { password: hashPassword(credentials.password) },
            })
          }
        }

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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.crewId = user.crewId
      }
      // The JWT strategy bakes name/role/etc into the token at sign-in and
      // never checks the database again on its own - so editing your own
      // name or role elsewhere in the app (Settings -> Users) has no
      // effect on your already-issued session until this fires. The app
      // triggers this explicitly (a POST to /api/auth/session, see
      // refreshSessionUser() in page.tsx) right after saving changes to
      // the logged-in user's own account. Deliberately not trusting
      // whatever `session` data the client posts here - it's used only as
      // a "go refresh yourself" signal, and the actual values always come
      // from a fresh database read, so this can't be used to hand a
      // session a role it doesn't actually have in the database.
      if (trigger === 'update' && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { company: true },
        })
        if (fresh) {
          token.name = fresh.name
          token.email = fresh.email
          token.role = fresh.role
          token.companyId = fresh.companyId
          token.companyName = fresh.company?.name
          token.crewId = fresh.crewId
        }
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
