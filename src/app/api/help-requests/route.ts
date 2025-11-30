import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createHelpRequestSchema = z.object({
  effortId: z.string().min(1, 'Effort ID is required'),
  type: z.enum(['SHELTER', 'FOOD', 'WATER', 'MEDICAL', 'EVACUATION', 'SUPPLIES', 'TRANSPORTATION', 'COMMUNICATION', 'OTHER']),
  urgency: z.enum(['CRITICAL', 'URGENT', 'IMPORTANT', 'ROUTINE']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2)
  }),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactEmail: z.string().email().optional(),
  canText: z.boolean().default(false),
  photos: z.array(z.string()).optional()
})

// GET /api/help-requests - List help requests with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const effortId = searchParams.get('effortId')
    const type = searchParams.get('type')
    const urgency = searchParams.get('urgency')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (effortId) {
      where.effortId = effortId
    }

    if (type) {
      where.type = type
    }

    if (urgency) {
      where.urgency = urgency
    }

    if (status) {
      where.status = status
    }

    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    // Geographic filtering (simplified)
    if (lat && lng && radius) {
      // This is a simplified implementation
      // In production, you'd use PostGIS for proper geographic queries
      where.AND = [
        {
          location: {
            path: ['coordinates'],
            array_contains: [[parseFloat(lng), parseFloat(lat)]]
          }
        }
      ]
    }

    const [helpRequests, total] = await Promise.all([
      db.helpRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          effort: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          requester: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { urgency: 'asc' }, // Critical first
          { createdAt: 'desc' }
        ]
      }),
      db.helpRequest.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: helpRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching help requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch help requests' },
      { status: 500 }
    )
  }
}

// POST /api/help-requests - Create a new help request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createHelpRequestSchema.parse(body)

    // Verify effort exists and is active
    const effort = await db.effort.findUnique({
      where: { id: validatedData.effortId }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Relief effort not found' },
        { status: 404 }
      )
    }

    if (effort.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Relief effort is not currently active' },
        { status: 400 }
      )
    }

    // Create help request
    const helpRequest = await db.helpRequest.create({
      data: {
        ...validatedData,
        status: 'NEW'
      },
      include: {
        effort: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Generate tracking code
    const trackingCode = `HR-${helpRequest.id.slice(-6).toUpperCase()}`

    // TODO: Send confirmation SMS/email if contact info provided
    // TODO: Notify effort organizers of new request

    return NextResponse.json({
      success: true,
      data: {
        ...helpRequest,
        trackingCode
      },
      message: 'Help request submitted successfully'
    })
  } catch (error) {
    console.error('Error creating help request:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit help request' },
      { status: 500 }
    )
  }
}
