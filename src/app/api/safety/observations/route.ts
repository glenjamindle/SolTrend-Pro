import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/safety/observations?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const observations = await prisma.safetyObservation.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = observations.map((o) => ({
      id: o.id,
      type: o.type,
      category: o.category,
      location: o.location,
      description: o.description,
      photos: o.photos ? JSON.parse(o.photos) : [],
      reportedBy: o.user?.name || 'Unknown',
      createdAt: o.createdAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching safety observations:', error)
    return NextResponse.json({ error: 'Failed to fetch safety observations' }, { status: 500 })
  }
}

// POST /api/safety/observations
// body: { projectId, type, category, location?, description, photos?, reportedBy }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, type, category, location, description, photos, reportedBy } = body

    if (!projectId || !type || !category || !description) {
      return NextResponse.json({ error: 'projectId, type, category, and description are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    let userId: string = reportedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this observation to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.safetyObservation.create({
      data: {
        projectId,
        type,
        category,
        location: location || undefined,
        description,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving safety observation:', error)
    return NextResponse.json({ error: 'Failed to save safety observation' }, { status: 500 })
  }
}

// DELETE /api/safety/observations?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a safety observation' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.safetyObservation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Safety observation not found' }, { status: 404 })
    }

    await prisma.safetyObservation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting safety observation:', error)
    return NextResponse.json({ error: 'Failed to delete safety observation' }, { status: 500 })
  }
}
