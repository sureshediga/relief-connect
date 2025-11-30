import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createEffortSchema = z.object({
  name: z.string().min(1, 'Effort name is required'),
  description: z.string().optional(),
  disasterType: z.enum(['HURRICANE', 'FLOOD', 'WILDFIRE', 'EARTHQUAKE', 'TORNADO', 'DROUGHT', 'PANDEMIC', 'OTHER']),
  affectedArea: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number())))
  }),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationType: z.enum(['NONPROFIT', 'GOVERNMENT', 'FAITH_BASED', 'COMMUNITY_GROUP', 'INDIVIDUAL', 'CORPORATE', 'OTHER']),
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  primaryContactEmail: z.string().email('Valid email is required'),
  primaryContactPhone: z.string().min(1, 'Primary contact phone is required'),
  primaryLanguage: z.string().default('en'),
  timezone: z.string().default('UTC'),
})

// GET /api/efforts - List all efforts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const disasterType = searchParams.get('disasterType')
    const status = searchParams.get('status')
    const verified = searchParams.get('verified')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    const slug = searchParams.get('slug')

    const skip = (page - 1) * limit
    const where: any = {}
    if (slug) {
      where.slug = slug
    }
    if (search && !slug) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (disasterType && !slug) {
      where.disasterType = disasterType
    }
    if (status && !slug) {
      where.status = status
    }
    if (verified !== null && !slug) {
      where.verified = verified === 'true'
    }

    // Geographic filtering (simplified - in production, use PostGIS)
    if (lat && lng && radius) {
      // This is a simplified implementation
      // In production, you'd use PostGIS for proper geographic queries
      where.AND = [
        {
          affectedArea: {
            path: ['coordinates'],
            array_contains: [[[parseFloat(lng), parseFloat(lat)]]]
          }
        }
      ]
    }

    // Fetch effort(s)
    const efforts = await db.effort.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        _count: { select: { helpRequests: true, volunteers: true, donations: true } }
      },
      skip: slug ? 0 : skip,
      take: slug ? 1 : limit,
    })

    return NextResponse.json({
      success: true,
      data: efforts,
      total: efforts.length
    })
  } catch (error) {
    console.error('Error fetching efforts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch efforts' },
      { status: 500 }
    )
  }
}

// POST /api/efforts - Create a new relief effort
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createEffortSchema.parse(body)

    // Generate slug from effort name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingEffort = await db.effort.findUnique({
      where: { slug }
    })

    if (existingEffort) {
      return NextResponse.json(
        { success: false, error: 'An effort with this name already exists' },
        { status: 400 }
      )
    }

    // Create the effort
    const effort = await db.effort.create({
      data: {
        ...validatedData,
        slug,
        organizerId: session.user.id,
        status: 'PENDING'
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create organizer membership
    await db.effortMember.create({
      data: {
        effortId: effort.id,
        userId: session.user.id,
        role: 'ORGANIZER'
      }
    })

    return NextResponse.json({
      success: true,
      data: effort,
      message: 'Relief effort created successfully. Pending verification.'
    })
  } catch (error) {
    console.error('Error creating effort:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create relief effort' },
      { status: 500 }
    )
  }
}
