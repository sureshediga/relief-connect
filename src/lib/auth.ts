import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        // For now, we'll use a simple password check
        // In production, you'd want to hash passwords properly
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ''
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

// Helper function to get current user
export async function getCurrentUser(userId: string): Promise<User | null> {
  return await db.user.findUnique({
    where: { id: userId }
  })
}

// Helper function to check if user has role in effort
export async function getUserEffortRole(
  userId: string,
  effortId: string
): Promise<string | null> {
  const membership = await db.effortMember.findUnique({
    where: {
      effortId_userId: {
        effortId,
        userId
      }
    }
  })
  
  return membership?.role || null
}

// Helper function to check if user can access effort
export async function canUserAccessEffort(
  userId: string,
  effortId: string,
  requiredRole?: string
): Promise<boolean> {
  const role = await getUserEffortRole(userId, effortId)
  
  if (!role) return false
  
  if (!requiredRole) return true
  
  const roleHierarchy = {
    ORGANIZER: 4,
    COORDINATOR: 3,
    VOLUNTEER: 2,
    VIEWER: 1
  }
  
  return roleHierarchy[role as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}
