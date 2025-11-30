import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { VolunteerStatus } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
      'address', 'city', 'state', 'zipCode', 'effortId'
    ]
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if effort exists
    const effort = await db.effort.findUnique({
      where: { id: data.effortId }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Relief effort not found' },
        { status: 404 }
      )
    }

    // Create volunteer record
    const volunteer = await db.volunteer.create({
      data: {
        effortId: data.effortId,
        userId: session.user.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        skills: data.skills || [],
        availability: data.availability || {},
        location: data.address ? {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates, should be geocoded
        } : undefined,
        emergencyContact: data.emergencyContactPhone || '',
        status: VolunteerStatus.REGISTERED
      }
    })

    return NextResponse.json({
      success: true,
      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        status: volunteer.status
      }
    })

  } catch (error) {
    console.error('Volunteer registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const effortId = searchParams.get('effortId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (effortId) {
      where.effortId = effortId
    }
    
    if (status) {
      where.status = status
    }

    const volunteers = await db.volunteer.findMany({
      where,
      include: {
        effort: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await db.volunteer.count({ where })

    return NextResponse.json({
      success: true,
      volunteers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
