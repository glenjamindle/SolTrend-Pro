import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/production?projectId=...
// Returns this project's daily production log, oldest first - the shape the
// dashboard/analytics widgets that read state.production expect.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const entries = await prisma.productionEntry.findMany({
      where: { projectId },
      include: { crew: { select: { name: true } } },
      orderBy: { date: 'asc' },
    })

    const shaped = entries.map((e) => ({
      date: e.date.toISOString().split('T')[0],
      piles: e.pilesInstalled,
      crew: e.crew?.name || null,
      notes: e.notes || null,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching production entries:', error)
    return NextResponse.json({ error: 'Failed to fetch production entries' }, { status: 500 })
  }
}

// POST /api/production
// body: { projectId, pilesInstalled, date?, crewId?, subcontractorId?, notes?, loggedBy, photos? }
//
// One entry per project per calendar day (see the ProductionEntry unique
// constraint on [projectId, date]) - logging again on the same day updates
// that day's totals instead of creating a second row. The project's cached
// installedPiles moves by the ACTUAL delta between the old and new pile
// count for that day, not by the raw new value, so re-logging the same day
// never double-counts piles that were already recorded.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, pilesInstalled, date, crewId, subcontractorId, notes, loggedBy, photos } = body

    if (!projectId || typeof pilesInstalled !== 'number' || pilesInstalled < 0) {
      return NextResponse.json({ error: 'projectId and a non-negative pilesInstalled are required' }, { status: 400 })
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
        return NextResponse.json({ error: 'No user available to attribute this entry to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    // Normalize to a UTC calendar day so re-logging "today" always lands on
    // the same row instead of drifting with time-of-day.
    const day = date ? new Date(date) : new Date()
    const entryDate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()))

    const existing = await prisma.productionEntry.findUnique({
      where: { projectId_date: { projectId, date: entryDate } },
    })

    const entry = await prisma.productionEntry.upsert({
      where: { projectId_date: { projectId, date: entryDate } },
      update: {
        pilesInstalled,
        crewId: crewId || undefined,
        subcontractorId: subcontractorId || undefined,
        notes: notes ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
      create: {
        projectId,
        date: entryDate,
        pilesInstalled,
        crewId: crewId || undefined,
        subcontractorId: subcontractorId || undefined,
        notes: notes ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
    })

    const delta = pilesInstalled - (existing?.pilesInstalled || 0)
    const updatedProject = delta !== 0
      ? await prisma.project.update({ where: { id: projectId }, data: { installedPiles: { increment: delta } } })
      : project

    return NextResponse.json({ entry, installedPiles: updatedProject.installedPiles })
  } catch (error) {
    console.error('Error saving production entry:', error)
    return NextResponse.json({ error: 'Failed to save production entry' }, { status: 500 })
  }
}
