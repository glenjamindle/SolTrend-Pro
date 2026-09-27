import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/punchlist?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const items = await prisma.punchItem.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = items.map((p) => ({
      id: p.id,
      description: p.description,
      location: p.location,
      status: p.status,
      priority: p.priority,
      assignedTo: p.assignedTo,
      dueDate: p.dueDate,
      notes: p.notes,
      photos: p.photos ? JSON.parse(p.photos) : [],
      resolvedAt: p.resolvedAt,
      createdBy: p.user?.name || 'Unknown',
      createdAt: p.createdAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching punch list:', error)
    return NextResponse.json({ error: 'Failed to fetch punch list' }, { status: 500 })
  }
}

// POST /api/punchlist
// body: { id?, projectId, description, location?, priority?, assignedTo?, dueDate?, notes?, photos?, status?, createdBy }
// No id -> creates a new item. With id -> updates that item in place (used
// for both editing fields and moving it through open -> in_progress ->
// resolved).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, description, location, priority, assignedTo, dueDate, notes, photos, status, createdBy } = body

    if (!projectId || (!id && !description)) {
      return NextResponse.json({ error: 'projectId and description are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    if (id) {
      const existing = await prisma.punchItem.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Punch item not found' }, { status: 404 })
      }
      const resolvedAt = status
        ? (status === 'resolved' ? (existing.status === 'resolved' ? existing.resolvedAt : new Date()) : null)
        : undefined
      const updated = await prisma.punchItem.update({
        where: { id },
        data: {
          description: description ?? undefined,
          location: location ?? undefined,
          priority: priority ?? undefined,
          assignedTo: assignedTo ?? undefined,
          dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
          notes: notes ?? undefined,
          photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
          status: status ?? undefined,
          resolvedAt,
        },
      })
      return NextResponse.json(updated)
    }

    let userId: string = createdBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this punch item to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.punchItem.create({
      data: {
        projectId,
        description,
        location: location || undefined,
        priority: priority || 'medium',
        assignedTo: assignedTo || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes || undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving punch item:', error)
    return NextResponse.json({ error: 'Failed to save punch item' }, { status: 500 })
  }
}

// DELETE /api/punchlist?id=... - admin-only, mirrors the delete policy used
// for every other destructive action in this app (see /api/settings).
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a punch list item' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.punchItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Punch item not found' }, { status: 404 })
    }

    await prisma.punchItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting punch item:', error)
    return NextResponse.json({ error: 'Failed to delete punch item' }, { status: 500 })
  }
}
