import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ResourceType } from '@/types'

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

    // Get donations for this effort
    const donations = await db.donation.findMany({
      where: {
        effortId: effort.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      donations: donations.map(donation => ({
        id: donation.id,
        type: donation.type,
        amount: donation.amount,
        description: donation.description,
        category: donation.category,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        anonymous: donation.anonymous,
        status: donation.status,
        processedAt: donation.processedAt?.toISOString(),
        createdAt: donation.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Donations fetch error:', error)
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

    // Validate required fields
    const requiredFields = ['type', 'description', 'donorName']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create donation
    const donation = await db.donation.create({
      data: {
        effortId: effort.id,
        type: data.type,
        amount: data.amount || 0,
        description: data.description,
        category: data.category,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        donorPhone: data.donorPhone,
        anonymous: data.anonymous || false,
        status: data.status || 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        type: donation.type,
        description: donation.description,
        donorName: donation.donorName,
        status: donation.status
      }
    })

  } catch (error) {
    console.error('Donation creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
