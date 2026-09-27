import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/delays?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const delays = await prisma.delayLog.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })

    const shaped = delays.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      reason: d.reason,
      description: d.description,
      hoursLost: d.hoursLost,
      user: d.user?.name || 'Unknown',
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching delay logs:', error)
    return NextResponse.json({ error: 'Failed to fetch delay logs' }, { status: 500 })
  }
}

// POST /api/delays
// body: { projectId, date?, reason, description?, hoursLost?, loggedBy }
// One entry per project per calendar day, same pattern as ProductionEntry -
// re-logging the same day updates it instead of creating a second row.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, date, reason, description, hoursLost, loggedBy } = body

    if (!projectId || !reason) {
      return NextResponse.json({ error: 'projectId and reason are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    let userId: string = loggedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this delay to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const day = date ? new Date(date) : new Date()
    const entryDate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()))

    const delay = await prisma.delayLog.upsert({
      where: { projectId_date: { projectId, date: entryDate } },
      update: {
        reason,
        description: description ?? undefined,
        hoursLost: typeof hoursLost === 'number' ? hoursLost : undefined,
        userId,
      },
      create: {
        projectId,
        date: entryDate,
        reason,
        description: description || undefined,
        hoursLost: typeof hoursLost === 'number' ? hoursLost : undefined,
        userId,
      },
    })

    return NextResponse.json(delay)
  } catch (error) {
    console.error('Error saving delay log:', error)
    return NextResponse.json({ error: 'Failed to save delay log' }, { status: 500 })
  }
}
