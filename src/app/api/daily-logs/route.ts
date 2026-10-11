import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/daily-logs?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const logs = await prisma.dailyLog.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })

    const shaped = logs.map((l) => ({
      date: l.date.toISOString().split('T')[0],
      crew: l.crew ? JSON.parse(l.crew) : [],
      weather: l.weather || null,
      visitors: l.visitors || null,
      narrative: l.narrative || null,
      photos: l.photos ? JSON.parse(l.photos) : [],
      user: l.user?.name || 'Unknown',
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching daily logs:', error)
    return NextResponse.json({ error: 'Failed to fetch daily logs' }, { status: 500 })
  }
}

// POST /api/daily-logs
// body: { projectId, date?, crew?, weather?, visitors?, narrative?, loggedBy, photos? }
// One entry per project per calendar day, same pattern as ProductionEntry/
// DelayLog - re-logging the same day updates it instead of creating a
// second row.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, date, crew, weather, visitors, narrative, loggedBy, photos } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
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
        return NextResponse.json({ error: 'No user available to attribute this log to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const day = date ? new Date(date) : new Date()
    const entryDate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()))

    const log = await prisma.dailyLog.upsert({
      where: { projectId_date: { projectId, date: entryDate } },
      update: {
        crew: Array.isArray(crew) && crew.length > 0 ? JSON.stringify(crew) : undefined,
        weather: weather ?? undefined,
        visitors: visitors ?? undefined,
        narrative: narrative ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
      create: {
        projectId,
        date: entryDate,
        crew: Array.isArray(crew) && crew.length > 0 ? JSON.stringify(crew) : undefined,
        weather: weather || undefined,
        visitors: visitors || undefined,
        narrative: narrative || undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error saving daily log:', error)
    return NextResponse.json({ error: 'Failed to save daily log' }, { status: 500 })
  }
}
