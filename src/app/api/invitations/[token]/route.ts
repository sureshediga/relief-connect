import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { InvitationStatus } from '@/types'

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await db.effortInvitation.findUnique({
      where: { token: params.token },
      include: {
        effort: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            organizationName: true
          }
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      await db.effortInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { success: false, error: 'Invitation has already been accepted' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        effort: invitation.effort,
        inviter: invitation.inviter
      }
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}

// POST /api/invitations/[token]/accept - Accept an invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const invitation = await db.effortInvitation.findUnique({
      where: { token: params.token },
      include: { effort: true }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      await db.effortInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { success: false, error: 'Invitation has already been accepted' },
        { status: 400 }
      )
    }

    // Verify email matches
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.email !== invitation.email) {
      return NextResponse.json(
        { success: false, error: 'This invitation was sent to a different email address' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.effortMember.findUnique({
      where: {
        effortId_userId: {
          effortId: invitation.effortId,
          userId: session.user.id
        }
      }
    })

    if (existingMember) {
      // Update invitation status
      await db.effortInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() }
      })
      return NextResponse.json(
        { success: false, error: 'You are already a member of this effort' },
        { status: 400 }
      )
    }

    // Create membership
    await db.effortMember.create({
      data: {
        effortId: invitation.effortId,
        userId: session.user.id,
        role: invitation.role,
        active: true
      }
    })

    // Update invitation status
    await db.effortInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        effortId: invitation.effortId,
        effortSlug: invitation.effort.slug
      }
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}


