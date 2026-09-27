import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/coi?projectId=...
// Status (valid / expiring soon / expired) is derived client-side from
// expiresAt, same as every other date-driven status badge in this app, so
// the "how many days out counts as expiring soon" threshold can change
// without a migration.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const cois = await prisma.coi.findMany({
      where: { projectId },
      include: { subcontractor: { select: { name: true } } },
      orderBy: { expiresAt: 'asc' },
    })

    const shaped = cois.map((c) => ({
      id: c.id,
      subcontractorId: c.subcontractorId,
      subcontractor: c.subcontractor?.name || 'Unknown',
      coverageType: c.coverageType,
      expiresAt: c.expiresAt,
      fileUrl: c.fileUrl,
      createdAt: c.createdAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching COIs:', error)
    return NextResponse.json({ error: 'Failed to fetch COIs' }, { status: 500 })
  }
}

// POST /api/coi
// body: { projectId, subcontractorId, coverageType, expiresAt, fileKey?, fileUrl?, loggedBy }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, subcontractorId, coverageType, expiresAt, fileKey, fileUrl, loggedBy } = body

    if (!projectId || !subcontractorId || !coverageType || !expiresAt) {
      return NextResponse.json({ error: 'projectId, subcontractorId, coverageType, and expiresAt are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }
    const subcontractor = await prisma.subcontractor.findUnique({ where: { id: subcontractorId } })
    if (!subcontractor) {
      return NextResponse.json({ error: 'Unknown subcontractor' }, { status: 404 })
    }

    let userId: string = loggedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this COI to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.coi.create({
      data: {
        projectId,
        subcontractorId,
        coverageType,
        expiresAt: new Date(expiresAt),
        fileKey: fileKey || undefined,
        fileUrl: fileUrl || undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving COI:', error)
    return NextResponse.json({ error: 'Failed to save COI' }, { status: 500 })
  }
}

// DELETE /api/coi?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a COI' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.coi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'COI not found' }, { status: 404 })
    }

    await prisma.coi.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting COI:', error)
    return NextResponse.json({ error: 'Failed to delete COI' }, { status: 500 })
  }
}
