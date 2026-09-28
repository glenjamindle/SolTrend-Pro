import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/submittals?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const submittals = await prisma.submittal.findMany({
      where: { projectId },
      include: { user: { select: { name: true } }, material: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = submittals.map((s) => ({
      id: s.id,
      number: s.number,
      specSection: s.specSection,
      type: s.type,
      revision: s.revision,
      status: s.status,
      dueDate: s.dueDate,
      fileKey: s.fileKey,
      fileUrl: s.fileUrl,
      materialId: s.materialId,
      materialName: s.material?.name || null,
      submittedBy: s.user?.name || 'Unknown',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching submittals:', error)
    return NextResponse.json({ error: 'Failed to fetch submittals' }, { status: 500 })
  }
}

// POST /api/submittals
// body: { id?, projectId, number?, specSection, type?, revision?, status?, dueDate?, fileKey?, fileUrl?, materialId?, submittedBy }
// No id -> creates a new submittal (auto-numbers SUB-001, SUB-002, ... per project).
// With id -> updates it in place (used to move status through the review
// workflow, or bump revision after a resubmission).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, number, specSection, type, revision, status, dueDate, fileKey, fileUrl, materialId, submittedBy } = body

    if (!projectId || (!id && !specSection)) {
      return NextResponse.json({ error: 'projectId and specSection are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    if (id) {
      const existing = await prisma.submittal.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Submittal not found' }, { status: 404 })
      }
      const updated = await prisma.submittal.update({
        where: { id },
        data: {
          specSection: specSection ?? undefined,
          type: type ?? undefined,
          revision: typeof revision === 'number' ? revision : (status === 'revise_resubmit' ? existing.revision + 1 : undefined),
          status: status ?? undefined,
          dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
          fileKey: fileKey ?? undefined,
          fileUrl: fileUrl ?? undefined,
          materialId: materialId === null ? null : (materialId ?? undefined),
        },
      })
      return NextResponse.json(updated)
    }

    let userId: string = submittedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this submittal to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    let subNumber = number
    if (!subNumber) {
      const count = await prisma.submittal.count({ where: { projectId } })
      subNumber = `SUB-${String(count + 1).padStart(3, '0')}`
    }

    const created = await prisma.submittal.create({
      data: {
        projectId,
        number: subNumber,
        specSection,
        type: type || 'product_data',
        revision: typeof revision === 'number' ? revision : 0,
        status: status || 'pending',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        fileKey: fileKey || null,
        fileUrl: fileUrl || null,
        materialId: materialId || null,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving submittal:', error)
    return NextResponse.json({ error: 'Failed to save submittal' }, { status: 500 })
  }
}

// DELETE /api/submittals?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a submittal' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.submittal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Submittal not found' }, { status: 404 })
    }

    await prisma.submittal.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting submittal:', error)
    return NextResponse.json({ error: 'Failed to delete submittal' }, { status: 500 })
  }
}
