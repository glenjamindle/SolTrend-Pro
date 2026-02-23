// Refusals API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List refusals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const pileId = searchParams.get('pileId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project belongs to user's company
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId: session.user.companyId }
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const where: any = { projectId }
    if (status) where.status = status
    if (pileId) where.pileId = pileId

    const [refusals, total] = await Promise.all([
      prisma.refusal.findMany({
        where,
        include: {
          reportedBy: { select: { id: true, name: true } },
          resolvedBy: { select: { id: true, name: true } },
          photos: true,
        },
        orderBy: { reportedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.refusal.count({ where })
    ])

    return NextResponse.json({ refusals, total })
  } catch (error) {
    console.error('Error fetching refusals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create refusal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId, pileId, rowNumber, pileNumber, reason,
      targetDepth, achievedDepth, notes, deviceInfo, gpsLat, gpsLng
    } = body

    if (!projectId || !pileId || !reason || targetDepth === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project belongs to user's company
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId: session.user.companyId }
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create refusal and update pile status
    const refusal = await prisma.$transaction(async (tx) => {
      // Create or update pile
      const pile = await tx.pile.upsert({
        where: { projectId_pileId: { projectId, pileId } },
        create: {
          pileId,
          rowNumber: rowNumber || parseInt(pileId.split('-')[0]),
          pileNumber: pileNumber || parseInt(pileId.split('-')[1]),
          status: 'REFUSAL',
          projectId,
        },
        update: { status: 'REFUSAL' }
      })

      // Create refusal
      const ref = await tx.refusal.create({
        data: {
          pileId,
          rowNumber: rowNumber || parseInt(pileId.split('-')[0]),
          pileNumber: pileNumber || parseInt(pileId.split('-')[1]),
          reason,
          targetDepth,
          achievedDepth: achievedDepth || 0,
          notes,
          deviceInfo,
          gpsLat,
          gpsLng,
          projectId,
          reportedById: session.user.id,
          pile: { connect: { id: pile.id } }
        },
        include: {
          reportedBy: { select: { id: true, name: true } }
        }
      })

      // Update project refusal count
      await tx.project.update({
        where: { id: projectId },
        data: { refusalCount: { increment: 1 } }
      })

      // Create activity log
      await tx.activity.create({
        data: {
          type: 'REFUSAL_LOGGED',
          message: `Logged refusal at pile ${pileId} - ${reason}`,
          entityType: 'refusal',
          entityId: ref.id,
          projectId,
          userId: session.user.id,
        }
      })

      return ref
    })

    return NextResponse.json(refusal, { status: 201 })
  } catch (error) {
    console.error('Error creating refusal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update refusal (resolve)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, resolution } = body

    if (!id) {
      return NextResponse.json({ error: 'Refusal ID required' }, { status: 400 })
    }

    const refusal = await prisma.refusal.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined,
        resolvedById: session.user.id,
      },
      include: {
        reportedBy: { select: { id: true, name: true } },
        resolvedBy: { select: { id: true, name: true } }
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'REFUSAL_RESOLVED',
        message: `Resolved refusal at pile ${refusal.pileId}`,
        entityType: 'refusal',
        entityId: refusal.id,
        projectId: refusal.projectId,
        userId: session.user.id,
      }
    })

    return NextResponse.json(refusal)
  } catch (error) {
    console.error('Error updating refusal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
