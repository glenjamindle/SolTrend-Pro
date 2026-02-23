// Production API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List production logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '30')
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
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      prisma.productionLog.findMany({
        where,
        include: {
          crew: true,
          subcontractor: true,
          recordedBy: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.productionLog.count({ where })
    ])

    // Get summary stats
    const stats = await prisma.productionLog.aggregate({
      where,
      _sum: {
        pilesInstalled: true,
        inspectionsPassed: true,
        inspectionsFailed: true,
        refusalsLogged: true,
      },
      _avg: {
        pilesInstalled: true,
      }
    })

    return NextResponse.json({ logs, total, stats })
  } catch (error) {
    console.error('Error fetching production logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create/Update production log
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId, date,
      pilesInstalled, inspectionsPassed, inspectionsFailed, refusalsLogged,
      crewId, subcontractorId, notes, weatherConditions, temperature
    } = body

    if (!projectId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project belongs to user's company
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId: session.user.companyId }
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Upsert production log (one per project per day)
    const log = await prisma.productionLog.upsert({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date)
        }
      },
      create: {
        projectId,
        date: new Date(date),
        pilesInstalled: pilesInstalled || 0,
        inspectionsPassed: inspectionsPassed || 0,
        inspectionsFailed: inspectionsFailed || 0,
        refusalsLogged: refusalsLogged || 0,
        crewId,
        subcontractorId,
        notes,
        weatherConditions,
        temperature,
        recordedById: session.user.id,
      },
      update: {
        pilesInstalled: pilesInstalled ?? undefined,
        inspectionsPassed: inspectionsPassed ?? undefined,
        inspectionsFailed: inspectionsFailed ?? undefined,
        refusalsLogged: refusalsLogged ?? undefined,
        crewId,
        subcontractorId,
        notes,
        weatherConditions,
        temperature,
      },
      include: {
        crew: true,
        recordedBy: { select: { id: true, name: true } }
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'PRODUCTION_LOGGED',
        message: `Logged production for ${date}: ${pilesInstalled} piles`,
        entityType: 'production',
        entityId: log.id,
        projectId,
        userId: session.user.id,
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating production log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
