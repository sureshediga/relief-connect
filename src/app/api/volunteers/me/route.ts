import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find volunteer record for the current user
    const volunteer = await db.volunteer.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        effort: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true
          }
        },
        hours: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    })

    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        status: volunteer.status,
        skills: volunteer.skills,
        availability: volunteer.availability,
        verified: volunteer.verified,
        backgroundCheckPassed: volunteer.backgroundCheckPassed,
        totalHours: volunteer.totalHours,
        lastActive: volunteer.lastActive?.toISOString(),
        createdAt: volunteer.createdAt.toISOString(),
        effort: volunteer.effort,
        hours: volunteer.hours.map(hour => ({
          id: hour.id,
          date: hour.date.toISOString(),
          hours: hour.hours,
          activity: hour.activity,
          description: hour.description,
          verified: hour.verified
        }))
      }
    })

  } catch (error) {
    console.error('Volunteer fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
