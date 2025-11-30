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

    // Get messages for this effort
    const messages = await db.communication.findMany({
      where: {
        effortId: effort.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      messages: messages.map(message => ({
        id: message.id,
        title: message.title,
        content: message.content,
        type: message.type,
        status: message.status,
        channels: message.channels,
        recipients: {
          total: message.sentCount,
          sent: message.sentCount,
          delivered: message.deliveredCount,
          opened: message.openedCount,
          clicked: message.clickedCount
        },
        scheduledFor: message.scheduledAt?.toISOString(),
        createdAt: message.createdAt.toISOString(),
        sentAt: message.sentAt?.toISOString(),
        authorId: message.authorId
      }))
    })

  } catch (error) {
    console.error('Messages fetch error:', error)
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
    const requiredFields = ['title', 'content', 'type']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create message
    const message = await db.communication.create({
      data: {
        effortId: effort.id,
        authorId: session.user.id,
        title: data.title,
        content: data.content,
        type: data.type,
        channels: data.channels || ['EMAIL'],
        status: data.status || 'DRAFT',
        scheduledAt: data.scheduledFor ? new Date(data.scheduledFor) : null
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        title: message.title,
        type: message.type,
        status: message.status
      }
    })

  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
