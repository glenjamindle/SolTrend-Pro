import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      companyId: string
      companyName?: string
      crewId?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    companyId: string
    companyName?: string
    crewId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    companyId: string
    companyName?: string
    crewId?: string | null
  }
}
