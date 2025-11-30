import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug } = params

    // Find the effort by slug
    const effort = await db.effort.findUnique({
      where: { slug },
      select: { id: true, organizerId: true }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Relief effort not found' },
        { status: 404 }
      )
    }

    // Check if user is organizer or has access
    if (effort.organizerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get volunteers for this effort
    const volunteers = await db.volunteer.findMany({
      where: {
        effortId: effort.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        hours: {
          orderBy: {
            date: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      volunteers: volunteers.map(volunteer => ({
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        status: volunteer.status,
        skills: volunteer.skills,
        verified: volunteer.verified,
        backgroundCheckPassed: volunteer.backgroundCheckPassed,
        totalHours: volunteer.totalHours,
        lastActive: volunteer.lastActive?.toISOString(),
        createdAt: volunteer.createdAt.toISOString(),
        user: volunteer.user,
        hours: volunteer.hours.map(hour => ({
          id: hour.id,
          date: hour.date.toISOString(),
          hours: hour.hours,
          description: hour.description,
          verified: hour.verified
        }))
      }))
    })

  } catch (error) {
    console.error('Volunteers fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
