import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/safety/incidents?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const incidents = await prisma.safetyIncident.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = incidents.map((i) => ({
      id: i.id,
      severity: i.severity,
      description: i.description,
      correctiveAction: i.correctiveAction,
      status: i.status,
      photos: i.photos ? JSON.parse(i.photos) : [],
      resolvedAt: i.resolvedAt,
      reportedBy: i.user?.name || 'Unknown',
      createdAt: i.createdAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching safety incidents:', error)
    return NextResponse.json({ error: 'Failed to fetch safety incidents' }, { status: 500 })
  }
}

// POST /api/safety/incidents
// body: { id?, projectId, severity, description, correctiveAction?, status?, photos?, reportedBy }
// No id -> creates a new incident. With id -> updates it in place (used to
// add a corrective action and close it out), same pattern as /api/punchlist.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, severity, description, correctiveAction, status, photos, reportedBy } = body

    if (!projectId || (!id && (!severity || !description))) {
      return NextResponse.json({ error: 'projectId, severity, and description are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    if (id) {
      const existing = await prisma.safetyIncident.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
      }
      const resolvedAt = status
        ? (status === 'closed' ? (existing.status === 'closed' ? existing.resolvedAt : new Date()) : null)
        : undefined
      const updated = await prisma.safetyIncident.update({
        where: { id },
        data: {
          severity: severity ?? undefined,
          description: description ?? undefined,
          correctiveAction: correctiveAction ?? undefined,
          photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
          status: status ?? undefined,
          resolvedAt,
        },
      })
      return NextResponse.json(updated)
    }

    let userId: string = reportedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this incident to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.safetyIncident.create({
      data: {
        projectId,
        severity,
        description,
        correctiveAction: correctiveAction || undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving safety incident:', error)
    return NextResponse.json({ error: 'Failed to save safety incident' }, { status: 500 })
  }
}

// DELETE /api/safety/incidents?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a safety incident' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.safetyIncident.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Safety incident not found' }, { status: 404 })
    }

    await prisma.safetyIncident.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting safety incident:', error)
    return NextResponse.json({ error: 'Failed to delete safety incident' }, { status: 500 })
  }
}
