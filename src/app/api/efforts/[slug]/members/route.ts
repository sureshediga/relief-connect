import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getUserEffortRole } from '@/lib/auth'
import { EffortRole } from '@/types'

// GET /api/efforts/[slug]/members - List members of an effort
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

    // Check if user is a member
    const userRole = await getUserEffortRole(session.user.id, effort.id)
    if (!userRole) {
      return NextResponse.json(
        { success: false, error: 'You must be a member to view members' },
        { status: 403 }
      )
    }

    const members = await db.effortMember.findMany({
      where: { effortId: effort.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            image: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // ORGANIZER first, then COORDINATOR, etc.
        { joinedAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: members.map(member => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        active: member.active,
        user: member.user ? {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar || member.user.image
        } : null
      }))
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// PATCH /api/efforts/[slug]/members/[id] - Update member role
export async function PATCH(
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

    // Only ORGANIZER can update member roles
    const userRole = await getUserEffortRole(session.user.id, effort.id)
    if (userRole !== 'ORGANIZER') {
      return NextResponse.json(
        { success: false, error: 'Only organizers can update member roles' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')
    const body = await request.json()
    const { role, active } = body

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const member = await db.effortMember.findUnique({
      where: { id: memberId }
    })

    if (!member || member.effortId !== effort.id) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prevent changing organizer role
    if (member.role === 'ORGANIZER' && role !== 'ORGANIZER') {
      return NextResponse.json(
        { success: false, error: 'Cannot change organizer role' },
        { status: 400 }
      )
    }

    // Validate role
    if (role && !Object.values(EffortRole).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    const updatedMember = await db.effortMember.update({
      where: { id: memberId },
      data: {
        ...(role && { role }),
        ...(active !== undefined && { active })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMember.id,
        userId: updatedMember.userId,
        role: updatedMember.role,
        joinedAt: updatedMember.joinedAt,
        active: updatedMember.active,
        user: updatedMember.user ? {
          id: updatedMember.user.id,
          name: updatedMember.user.name,
          email: updatedMember.user.email,
          avatar: updatedMember.user.avatar || updatedMember.user.image
        } : null
      },
      message: 'Member updated successfully'
    })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/efforts/[slug]/members/[id] - Remove a member
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

    const effort = await db.effort.findUnique({
      where: { slug: params.slug }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Only ORGANIZER can remove members
    const userRole = await getUserEffortRole(session.user.id, effort.id)
    if (userRole !== 'ORGANIZER') {
      return NextResponse.json(
        { success: false, error: 'Only organizers can remove members' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const member = await db.effortMember.findUnique({
      where: { id: memberId }
    })

    if (!member || member.effortId !== effort.id) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prevent removing organizer
    if (member.role === 'ORGANIZER') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove organizer' },
        { status: 400 }
      )
    }

    await db.effortMember.delete({
      where: { id: memberId }
    })

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}


