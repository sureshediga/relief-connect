import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ActivityItem {
  id: string
  type: 'volunteer_joined' | 'help_request_resolved' | 'donation_received' | 'volunteer_hours_logged' | 'resource_added' | 'help_request_created'
  message: string
  timestamp: string
  effortId?: string
  effortName?: string
  color: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const effortId = searchParams.get('effortId')

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const activities: ActivityItem[] = []

    // Get user's efforts
    const userEfforts = await db.effort.findMany({
      where: {
        organizerId: session.user.id,
        ...(effortId ? { id: effortId } : {})
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    const effortIds = userEfforts.map(e => e.id)

    if (effortIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Fetch recent volunteers (last 7 days)
    const recentVolunteers = await db.volunteer.findMany({
      where: {
        effortId: { in: effortIds },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        effort: {
          select: { name: true, slug: true }
        },
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    recentVolunteers.forEach(volunteer => {
      const volunteerName = volunteer.user?.name || 'A volunteer'
      activities.push({
        id: `volunteer-${volunteer.id}`,
        type: 'volunteer_joined',
        message: `New volunteer ${volunteerName} joined ${volunteer.effort.name}`,
        timestamp: volunteer.createdAt.toISOString(),
        effortId: volunteer.effortId,
        effortName: volunteer.effort.name,
        color: 'green'
      })
    })

    // Fetch resolved help requests (last 7 days)
    const resolvedRequests = await db.helpRequest.findMany({
      where: {
        effortId: { in: effortIds },
        status: 'RESOLVED',
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        effort: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })

    resolvedRequests.forEach(request => {
      activities.push({
        id: `request-${request.id}`,
        type: 'help_request_resolved',
        message: `Help request resolved in ${request.effort.name}`,
        timestamp: request.updatedAt.toISOString(),
        effortId: request.effortId,
        effortName: request.effort.name,
        color: 'blue'
      })
    })

    // Fetch recent donations (last 7 days)
    const recentDonations = await db.donation.findMany({
      where: {
        effortId: { in: effortIds },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        effort: {
          select: { name: true, slug: true }
        },
        donor: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    recentDonations.forEach(donation => {
      activities.push({
        id: `donation-${donation.id}`,
        type: 'donation_received',
        message: `New donation received for ${donation.effort.name}`,
        timestamp: donation.createdAt.toISOString(),
        effortId: donation.effortId,
        effortName: donation.effort.name,
        color: 'yellow'
      })
    })

    // Sort by timestamp and limit
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      success: true,
      data: activities.slice(0, limit)
    })
  } catch (error: any) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

