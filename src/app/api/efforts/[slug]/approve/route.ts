import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isUserAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const approveEffortSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED']),
  verified: z.boolean().optional(),
  verificationNotes: z.string().optional(),
})

// PATCH /api/efforts/[slug]/approve - Approve or reject a relief effort (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isUserAdmin(session.user.id)
    if (!userIsAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Next.js 14+ requires awaiting params
    const { slug } = await params
    const body = await request.json()
    const validatedData = approveEffortSchema.parse(body)

    // Check if effort exists
    const effort = await db.effort.findUnique({
      where: { slug }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Update effort status and verification
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date(),
    }

    if (validatedData.verified !== undefined) {
      updateData.verified = validatedData.verified
      if (validatedData.verified) {
        updateData.verifiedAt = new Date()
      }
    }

    if (validatedData.verificationNotes !== undefined) {
      updateData.verificationNotes = validatedData.verificationNotes
    }

    // If approving, set startedAt if not already set
    if (validatedData.status === 'ACTIVE' && !effort.startedAt) {
      updateData.startedAt = new Date()
    }

    const updatedEffort = await db.effort.update({
      where: { slug },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: updatedEffort,
      message: `Effort ${validatedData.status === 'ACTIVE' ? 'approved' : 'updated'} successfully`
    })
  } catch (error) {
    console.error('Error approving effort:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update effort' },
      { status: 500 }
    )
  }
}

