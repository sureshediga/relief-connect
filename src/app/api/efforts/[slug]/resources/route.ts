import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ResourceType, ResourceStatus } from '@/types'

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

    // Check if user has access (organizer or member)
    const member = await db.effortMember.findFirst({
      where: {
        effortId: effort.id,
        userId: session.user.id
      }
    })

    if (effort.organizerId !== session.user.id && !member) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get resources for this effort
    const resources = await db.resource.findMany({
      where: {
        effortId: effort.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      resources: resources.map(resource => ({
        id: resource.id,
        name: resource.name,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        quantity: resource.quantity,
        unit: resource.unit,
        status: resource.status,
        location: resource.location,
        condition: resource.condition,
        expiryDate: resource.expiryDate?.toISOString(),
        source: resource.source,
        donorId: resource.donorId,
        distributed: resource.distributed,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Resources fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const data = await request.json()

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

    // Check if user is organizer
    if (effort.organizerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Validate required fields
    const requiredFields = ['name', 'type', 'quantity', 'unit']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Determine status based on quantity
    let status = ResourceStatus.AVAILABLE
    if (data.quantity <= 0) {
      status = ResourceStatus.DISTRIBUTED
    }

    // Check for expiry
    if (data.expiryDate) {
      const expiryDate = new Date(data.expiryDate)
      const now = new Date()
      if (expiryDate <= now) {
        status = ResourceStatus.EXPIRED
      }
    }

    // Create resource
    const resource = await db.resource.create({
      data: {
        effortId: effort.id,
        name: data.name,
        description: data.description || '',
        type: data.type,
        category: data.category || 'OTHER',
        quantity: data.quantity,
        unit: data.unit,
        status,
        location: data.location || null,
        condition: data.condition || 'New',
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        source: data.source || '',
        donorId: data.donorId || null
      }
    })

    return NextResponse.json({
      success: true,
      resource: {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        quantity: resource.quantity,
        status: resource.status
      }
    })

  } catch (error) {
    console.error('Resource creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
