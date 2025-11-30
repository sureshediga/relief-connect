import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// GET /api/efforts/[slug] - Get effort by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const effort = await db.effort.findUnique({
      where: { slug },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            helpRequests: true,
            volunteers: true,
            donations: true,
            resources: true
          }
        }
      }
    })

    if (!effort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Only return public data for non-authenticated requests
    const publicEffort = {
      id: effort.id,
      slug: effort.slug,
      name: effort.name,
      description: effort.description,
      disasterType: effort.disasterType,
      status: effort.status,
      affectedArea: effort.affectedArea,
      organizationName: effort.organizationName,
      organizationType: effort.organizationType,
      primaryContactName: effort.primaryContactName,
      primaryContactEmail: effort.primaryContactEmail,
      primaryContactPhone: effort.primaryContactPhone,
      primaryLanguage: effort.primaryLanguage,
      timezone: effort.timezone,
      verified: effort.verified,
      createdAt: effort.createdAt,
      startedAt: effort.startedAt,
      _count: effort._count
    }

    return NextResponse.json({
      success: true,
      data: publicEffort
    })
  } catch (error) {
    console.error('Error fetching effort:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch effort' },
      { status: 500 }
    )
  }
}

// PUT /api/efforts/[slug] - Update effort
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    // Check if effort exists
    const existingEffort = await db.effort.findUnique({
      where: { slug }
    })

    if (!existingEffort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Update effort
    const updatedEffort = await db.effort.update({
      where: { slug },
      data: {
        ...body,
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      data: updatedEffort,
      message: 'Effort updated successfully'
    })
  } catch (error) {
    console.error('Error updating effort:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update effort' },
      { status: 500 }
    )
  }
}

// DELETE /api/efforts/[slug] - Delete effort
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Check if effort exists
    const existingEffort = await db.effort.findUnique({
      where: { slug }
    })

    if (!existingEffort) {
      return NextResponse.json(
        { success: false, error: 'Effort not found' },
        { status: 404 }
      )
    }

    // Delete effort (cascade will handle related records)
    await db.effort.delete({
      where: { slug }
    })

    return NextResponse.json({
      success: true,
      message: 'Effort deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting effort:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete effort' },
      { status: 500 }
    )
  }
}
