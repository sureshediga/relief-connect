import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Get overall platform statistics
    const [
      totalEfforts,
      activeEfforts,
      totalVolunteers,
      totalHelpRequests,
      totalDonations,
      verifiedOrganizations
    ] = await Promise.all([
      db.effort.count(),
      db.effort.count({ where: { status: 'ACTIVE' } }),
      db.volunteer.count({ where: { status: 'ACTIVE' } }),
      db.helpRequest.count({ where: { status: { not: 'CANCELLED' } } }),
      db.donation.count({ where: { status: 'PROCESSED' } }),
      db.effort.count({ where: { verified: true } })
    ])

    // Calculate people helped (resolved help requests)
    const peopleHelped = await db.helpRequest.count({
      where: { status: 'RESOLVED' }
    })

    // Calculate average response time (time from request creation to assignment)
    const helpRequestsWithTimes = await db.helpRequest.findMany({
      where: {
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] }
      },
      select: {
        createdAt: true,
        assignedAt: true
      }
    })

    let avgResponseTime = 0
    if (helpRequestsWithTimes.length > 0) {
      const totalHours = helpRequestsWithTimes.reduce((sum, req) => {
        if (req.assignedAt && req.createdAt) {
          const hours = (req.assignedAt.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60)
          return sum + hours
        }
        return sum
      }, 0)
      avgResponseTime = totalHours / helpRequestsWithTimes.length
    }

    // Get unique countries (from efforts' affected areas)
    // Count distinct efforts with different affected areas
    const uniqueEfforts = await db.effort.findMany({
      select: {
        affectedArea: true
      },
      distinct: ['affectedArea']
    })
    // For now, we'll use a simple count. In production, you'd parse GeoJSON to extract actual countries
    const countriesServed = uniqueEfforts.length > 0 ? uniqueEfforts.length : 1

    // If user is authenticated, get their personal stats
    let userStats = null
    if (session?.user?.id) {
      const userEfforts = await db.effort.findMany({
        where: { organizerId: session.user.id },
        include: {
          _count: {
            select: {
              volunteers: true,
              helpRequests: true,
              donations: true
            }
          }
        }
      })

      const userTotalVolunteers = await db.volunteer.count({
        where: {
          effortId: { in: userEfforts.map(e => e.id) },
          status: 'ACTIVE'
        }
      })

      const userTotalRequests = await db.helpRequest.count({
        where: {
          effortId: { in: userEfforts.map(e => e.id) },
          status: { not: 'CANCELLED' }
        }
      })

      const userPeopleHelped = await db.helpRequest.count({
        where: {
          effortId: { in: userEfforts.map(e => e.id) },
          status: 'RESOLVED'
        }
      })

      userStats = {
        totalEfforts: userEfforts.length,
        activeEfforts: userEfforts.filter(e => e.status === 'ACTIVE').length,
        totalVolunteers: userTotalVolunteers,
        totalRequests: userTotalRequests,
        peopleHelped: userPeopleHelped,
        avgResponseTime: avgResponseTime
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        platform: {
          totalEfforts,
          activeEfforts,
          totalVolunteers,
          totalHelpRequests,
          peopleHelped,
          totalDonations,
          verifiedOrganizations,
          countriesServed: countriesServed || 1, // Default to 1 if no data
          avgResponseTime: avgResponseTime || 0
        },
        user: userStats
      }
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

