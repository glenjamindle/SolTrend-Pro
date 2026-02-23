// Inspections API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List inspections
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
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
    if (startDate || endDate) {
      where.inspectedAt = {}
      if (startDate) where.inspectedAt.gte = new Date(startDate)
      if (endDate) where.inspectedAt.lte = new Date(endDate)
    }

    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        include: {
          inspector: { select: { id: true, name: true } },
          photos: true,
        },
        orderBy: { inspectedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.inspection.count({ where })
    ])

    return NextResponse.json({ inspections, total })
  } catch (error) {
    console.error('Error fetching inspections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create inspection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId, pileId, rowNumber, pileNumber, status,
      depth, plumbNS, plumbEW, twist, embedment,
      failReason, failNotes, batchId, deviceInfo, gpsLat, gpsLng
    } = body

    if (!projectId || !pileId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project belongs to user's company
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId: session.user.companyId }
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create inspection and update pile status
    const inspection = await prisma.$transaction(async (tx) => {
      // Create or update pile
      const pile = await tx.pile.upsert({
        where: { projectId_pileId: { projectId, pileId } },
        create: {
          pileId,
          rowNumber: rowNumber || parseInt(pileId.split('-')[0]),
          pileNumber: pileNumber || parseInt(pileId.split('-')[1]),
          status: status === 'PASS' ? 'PASSED' : 'FAILED',
          projectId,
        },
        update: {
          status: status === 'PASS' ? 'PASSED' : 'FAILED'
        }
      })

      // Create inspection
      const insp = await tx.inspection.create({
        data: {
          pileId,
          rowNumber: rowNumber || parseInt(pileId.split('-')[0]),
          pileNumber: pileNumber || parseInt(pileId.split('-')[1]),
          status,
          depth,
          plumbNS,
          plumbEW,
          twist,
          embedment,
          failReason,
          failNotes,
          batchId,
          deviceInfo,
          gpsLat,
          gpsLng,
          projectId,
          inspectorId: session.user.id,
          pile: { connect: { id: pile.id } }
        },
        include: {
          inspector: { select: { id: true, name: true } }
        }
      })

      // Update project counts
      await tx.project.update({
        where: { id: projectId },
        data: {
          passedInspections: { increment: status === 'PASS' ? 1 : 0 },
          failedInspections: { increment: status === 'FAIL' ? 1 : 0 },
        }
      })

      // Create activity log
      await tx.activity.create({
        data: {
          type: status === 'PASS' ? 'INSPECTION_PASS' : 'INSPECTION_FAIL',
          message: `${status === 'PASS' ? 'Passed' : 'Failed'} pile ${pileId}`,
          entityType: 'inspection',
          entityId: insp.id,
          projectId,
          userId: session.user.id,
        }
      })

      return insp
    })

    return NextResponse.json(inspection, { status: 201 })
  } catch (error) {
    console.error('Error creating inspection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
