import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { canUserAccessEffort, getUserEffortRole } from '@/lib/auth'
import { EffortRole, InvitationStatus } from '@/types'
import { randomBytes } from 'crypto'

// GET /api/efforts/[slug]/invitations - List invitations for an effort
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

    const effort = await db.effort.findUnique({
      where: { slug: params.slug }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Check if user has permission (ORGANIZER or COORDINATOR)
    const userRole = await getUserEffortRole(session.user.id, effort.id)
    if (userRole !== 'ORGANIZER' && userRole !== 'COORDINATOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const invitations = await db.effortInvitation.findMany({
      where: { effortId: effort.id },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        createdAt: inv.createdAt,
        inviter: inv.inviter ? {
          id: inv.inviter.id,
          name: inv.inviter.name,
          email: inv.inviter.email
        } : null
      }))
    })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

// POST /api/efforts/[slug]/invitations - Create a new invitation
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

    const effort = await db.effort.findUnique({
      where: { slug: params.slug }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Check if user has permission (ORGANIZER or COORDINATOR)
    const userRole = await getUserEffortRole(session.user.id, effort.id)
    if (userRole !== 'ORGANIZER' && userRole !== 'COORDINATOR') {
      return NextResponse.json(
        { success: false, error: 'Only organizers and coordinators can invite members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!Object.values(EffortRole).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.effortMember.findUnique({
      where: {
        effortId_userId: {
          effortId: effort.id,
          userId: (await db.user.findUnique({ where: { email } }))?.id || ''
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'User is already a member of this effort' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.effortInvitation.findUnique({
      where: {
        effortId_email: {
          effortId: effort.id,
          email
        }
      }
    })

    if (existingInvitation && existingInvitation.status === 'PENDING' && existingInvitation.expiresAt > new Date()) {
      return NextResponse.json(
        { success: false, error: 'An invitation is already pending for this email' },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const invitation = await db.effortInvitation.create({
      data: {
        effortId: effort.id,
        email,
        role,
        invitedBy: session.user.id,
        token,
        expiresAt,
        status: 'PENDING'
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Send invitation email here

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        token: invitation.token, // Include token for email sending
        inviter: invitation.inviter
      },
      message: 'Invitation sent successfully'
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

// DELETE /api/efforts/[slug]/invitations/[id] - Cancel an invitation
export async function DELETE(
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

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { success: false, error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    const invitation = await db.effortInvitation.findUnique({
      where: { id: invitationId },
      include: { effort: true }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if user has permission
    const userRole = await getUserEffortRole(session.user.id, invitation.effortId)
    if (userRole !== 'ORGANIZER' && userRole !== 'COORDINATOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await db.effortInvitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    })
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel invitation' },
      { status: 500 }
    )
  }
}


