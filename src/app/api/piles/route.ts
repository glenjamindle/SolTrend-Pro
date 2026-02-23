// Piles API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List piles or get pile status for heatmap
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const rowRange = searchParams.get('rowRange')
    const pileRange = searchParams.get('pileRange')
    const limit = parseInt(searchParams.get('limit') || '2000')

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
    if (rowRange) {
      const [minRow, maxRow] = rowRange.split('-').map(Number)
      where.rowNumber = { gte: minRow, lte: maxRow }
    }
    if (pileRange) {
      const [minPile, maxPile] = pileRange.split('-').map(Number)
      where.pileNumber = { gte: minPile, lte: maxPile }
    }

    const piles = await prisma.pile.findMany({
      where,
      select: {
        id: true,
        pileId: true,
        rowNumber: true,
        pileNumber: true,
        status: true,
        latitude: true,
        longitude: true,
      },
      orderBy: [{ rowNumber: 'asc' }, { pileNumber: 'asc' }],
      take: limit,
    })

    // Get status counts for summary
    const statusCounts = await prisma.pile.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { status: true }
    })

    return NextResponse.json({
      piles,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error('Error fetching piles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create pile(s) (bulk create for project setup)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, piles, totalRows, pilesPerRow } = body

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

    let createdCount = 0

    // If totalRows and pilesPerRow provided, generate grid
    if (totalRows && pilesPerRow) {
      const pileData = []
      for (let row = 1; row <= totalRows; row++) {
        for (let pile = 1; pile <= pilesPerRow; pile++) {
          pileData.push({
            pileId: `${row}-${pile}`,
            rowNumber: row,
            pileNumber: pile,
            status: 'NOT_STARTED',
            projectId,
          })
        }
      }

      // Bulk create (chunked to avoid memory issues)
      const chunkSize = 500
      for (let i = 0; i < pileData.length; i += chunkSize) {
        const chunk = pileData.slice(i, i + chunkSize)
        await prisma.pile.createMany({
          data: chunk,
          skipDuplicates: true
        })
        createdCount += chunk.length
      }

      // Update project total piles
      await prisma.project.update({
        where: { id: projectId },
        data: { totalPiles: totalRows * pilesPerRow }
      })
    }
    // Otherwise use provided piles array
    else if (piles && Array.isArray(piles)) {
      await prisma.pile.createMany({
        data: piles.map(p => ({
          pileId: p.pileId,
          rowNumber: p.rowNumber || parseInt(p.pileId.split('-')[0]),
          pileNumber: p.pileNumber || parseInt(p.pileId.split('-')[1]),
          status: p.status || 'NOT_STARTED',
          projectId,
          latitude: p.latitude,
          longitude: p.longitude,
        })),
        skipDuplicates: true
      })
      createdCount = piles.length
    }

    return NextResponse.json({
      success: true,
      createdCount,
      message: `Created ${createdCount} piles`
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating piles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
