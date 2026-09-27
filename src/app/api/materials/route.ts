import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/materials?projectId=...
// deliveredQty is a running total kept in sync by /api/deliveries each time
// a delivery is logged against a material, not editable directly here - so
// it can never drift from the sum of the delivery log underneath it.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const materials = await prisma.material.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    })

    const shaped = materials.map((m) => ({
      id: m.id,
      name: m.name,
      orderedQty: m.orderedQty,
      deliveredQty: m.deliveredQty,
      unit: m.unit,
      expectedDate: m.expectedDate,
      supplier: m.supplier,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}

// POST /api/materials
// body: { id?, projectId, name, orderedQty?, unit?, expectedDate?, supplier?, loggedBy }
// No id -> creates a new bill-of-materials line item. With id -> updates
// its ordered qty/unit/expected date/supplier (never deliveredQty - see
// GET above).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, name, orderedQty, unit, expectedDate, supplier, loggedBy } = body

    if (!projectId || (!id && !name)) {
      return NextResponse.json({ error: 'projectId and name are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    if (id) {
      const existing = await prisma.material.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 })
      }
      const updated = await prisma.material.update({
        where: { id },
        data: {
          name: name ?? undefined,
          orderedQty: typeof orderedQty === 'number' ? orderedQty : undefined,
          unit: unit ?? undefined,
          expectedDate: expectedDate ? new Date(expectedDate) : expectedDate === null ? null : undefined,
          supplier: supplier ?? undefined,
        },
      })
      return NextResponse.json(updated)
    }

    let userId: string = loggedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this material to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.material.create({
      data: {
        projectId,
        name,
        orderedQty: typeof orderedQty === 'number' ? orderedQty : 0,
        unit: unit || 'units',
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        supplier: supplier || undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving material:', error)
    return NextResponse.json({ error: 'Failed to save material' }, { status: 500 })
  }
}

// DELETE /api/materials?id=... - admin-only, same delete policy as everywhere else.
// Also removes its delivery log (a delivery makes no sense without the
// material line item it was logged against).
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a material' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.material.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.delivery.deleteMany({ where: { materialId: id } }),
      prisma.material.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting material:', error)
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
  }
}
