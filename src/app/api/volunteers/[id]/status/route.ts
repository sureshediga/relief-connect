import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { VolunteerStatus } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const { status } = await request.json()

    if (!Object.values(VolunteerStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get volunteer with effort info
    const volunteer = await db.volunteer.findUnique({
      where: { id },
      include: {
        effort: {
          select: {
            id: true,
            organizerId: true
          }
        }
      }
    })

    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      )
    }

    // Check if user is organizer of the effort
    if (volunteer.effort.organizerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update volunteer status
    const updatedVolunteer = await db.volunteer.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      volunteer: {
        id: updatedVolunteer.id,
        name: updatedVolunteer.name,
        status: updatedVolunteer.status,
        user: updatedVolunteer.user
      }
    })

  } catch (error) {
    console.error('Volunteer status update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
