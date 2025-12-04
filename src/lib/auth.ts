import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see what's happening
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true
    },
    async jwt({ token, user, account, profile }) {
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[JWT Callback]', { 
          hasUser: !!user, 
          hasAccount: !!account, 
          hasProfile: !!profile,
          tokenId: token.id,
          userEmail: user?.email || (profile as any)?.email
        })
      }

      // Initial sign in - user object is available from adapter
      if (user) {
        token.id = user.id
        token.email = user.email || (profile as any)?.email
        token.name = user.name || (profile as any)?.name
        token.picture = user.image || (profile as any)?.picture
        // Add admin status
        if (token.email) {
          token.isAdmin = isAdmin(token.email as string)
        }
      }
      
      // If account exists but user doesn't (edge case with PrismaAdapter), fetch from database
      if (account && !user) {
        const email = (profile as any)?.email || token.email
        if (email) {
          try {
            const dbUser = await db.user.findUnique({
              where: { email }
            })
            if (dbUser) {
              token.id = dbUser.id
              token.email = dbUser.email
              token.name = dbUser.name
              token.picture = dbUser.image || dbUser.avatar
              // Add admin status
              if (dbUser.email) {
                token.isAdmin = isAdmin(dbUser.email)
              }
            }
          } catch (err) {
            console.error('[JWT Callback] Error fetching user:', err)
          }
        }
        token.accessToken = account.access_token
        token.provider = account.provider
      } else if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      
      return token
    },
    async session({ session, token }) {
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[Session Callback]', { 
          hasToken: !!token,
          tokenId: token.id,
          hasSessionUser: !!session.user
        })
      }

      // Send properties to the client
      if (token && session.user) {
        if (token.id) session.user.id = token.id as string
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
        // Add admin status
        if (token.email) {
          session.user.isAdmin = isAdmin(token.email as string)
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
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

// Helper function to check if user is admin
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  return adminEmails.includes(email.toLowerCase())
}

// Helper function to check if user is admin (async version for database lookup)
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })
  
  if (!user?.email) return false
  return isAdmin(user.email)
}