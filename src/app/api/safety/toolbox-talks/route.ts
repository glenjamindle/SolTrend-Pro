import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/safety/toolbox-talks?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const talks = await prisma.toolboxTalk.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    })

    const shaped = talks.map((t) => ({
      id: t.id,
      topic: t.topic,
      conductedBy: t.conductedBy,
      crewName: t.crewName,
      attendeeCount: t.attendeeCount,
      notes: t.notes,
      date: t.date,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching toolbox talks:', error)
    return NextResponse.json({ error: 'Failed to fetch toolbox talks' }, { status: 500 })
  }
}

// POST /api/safety/toolbox-talks
// body: { projectId, topic, conductedBy, crewName?, attendeeCount?, notes?, date?, loggedBy }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, topic, conductedBy, crewName, attendeeCount, notes, date, loggedBy } = body

    if (!projectId || !topic || !conductedBy) {
      return NextResponse.json({ error: 'projectId, topic, and conductedBy are required' }, { status: 400 })
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
        return NextResponse.json({ error: 'No user available to attribute this toolbox talk to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.toolboxTalk.create({
      data: {
        projectId,
        topic,
        conductedBy,
        crewName: crewName || undefined,
        attendeeCount: typeof attendeeCount === 'number' ? attendeeCount : 0,
        notes: notes || undefined,
        date: date ? new Date(date) : undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving toolbox talk:', error)
    return NextResponse.json({ error: 'Failed to save toolbox talk' }, { status: 500 })
  }
}

// DELETE /api/safety/toolbox-talks?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a toolbox talk' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.toolboxTalk.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Toolbox talk not found' }, { status: 404 })
    }

    await prisma.toolboxTalk.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting toolbox talk:', error)
    return NextResponse.json({ error: 'Failed to delete toolbox talk' }, { status: 500 })
  }
}
