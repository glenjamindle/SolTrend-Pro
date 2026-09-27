import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/milestones?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
    })

    const shaped = milestones.map((m) => ({
      id: m.id,
      phase: m.phase,
      sortOrder: m.sortOrder,
      plannedStart: m.plannedStart,
      plannedEnd: m.plannedEnd,
      actualStart: m.actualStart,
      actualEnd: m.actualEnd,
      status: m.status,
      percentComplete: m.percentComplete,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}

// POST /api/milestones
// body: { id?, projectId, phase, sortOrder?, plannedStart?, plannedEnd?, actualStart?, actualEnd?, status?, percentComplete?, loggedBy }
// No id -> creates a new phase. With id -> updates it in place.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, phase, sortOrder, plannedStart, plannedEnd, actualStart, actualEnd, status, percentComplete, loggedBy } = body

    if (!projectId || (!id && !phase)) {
      return NextResponse.json({ error: 'projectId and phase are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    if (id) {
      const existing = await prisma.milestone.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
      }
      const updated = await prisma.milestone.update({
        where: { id },
        data: {
          phase: phase ?? undefined,
          sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
          plannedStart: plannedStart ? new Date(plannedStart) : plannedStart === null ? null : undefined,
          plannedEnd: plannedEnd ? new Date(plannedEnd) : plannedEnd === null ? null : undefined,
          actualStart: actualStart ? new Date(actualStart) : actualStart === null ? null : undefined,
          actualEnd: actualEnd ? new Date(actualEnd) : actualEnd === null ? null : undefined,
          status: status ?? undefined,
          percentComplete: typeof percentComplete === 'number' ? percentComplete : undefined,
        },
      })
      return NextResponse.json(updated)
    }

    let userId: string = loggedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this milestone to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.milestone.create({
      data: {
        projectId,
        phase,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        plannedStart: plannedStart ? new Date(plannedStart) : undefined,
        plannedEnd: plannedEnd ? new Date(plannedEnd) : undefined,
        actualStart: actualStart ? new Date(actualStart) : undefined,
        actualEnd: actualEnd ? new Date(actualEnd) : undefined,
        status: status || 'not_started',
        percentComplete: typeof percentComplete === 'number' ? percentComplete : 0,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving milestone:', error)
    return NextResponse.json({ error: 'Failed to save milestone' }, { status: 500 })
  }
}

// DELETE /api/milestones?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a milestone' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.milestone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    await prisma.milestone.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
  }
}
