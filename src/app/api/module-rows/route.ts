import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/module-rows?projectId=... - every row with its slots, for the
// Module Map, Scan Mode (to resume a row already started), and the
// reconciliation count. No date range or filter - the map always shows
// the project's whole current state, same as Pile Map.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    const rows = await prisma.moduleRow.findMany({
      where: { projectId },
      include: { slots: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching module rows:', error)
    return NextResponse.json({ error: 'Failed to fetch module rows' }, { status: 500 })
  }
}

// POST /api/module-rows
// body: { projectId, rowId, expectedCount? } with no id -> find-or-create
//   (Settings -> Module Rows pre-building a row, or - formerly - a
//   ROWTAG-{rowId} scan: resume the row if it already exists this
//   project, otherwise start it). expectedCount is only applied when the
//   row is genuinely new - it never changes an existing row's count here,
//   that's always the explicit { id, expectedCount } edit below, so a
//   re-paste of the same bulk list can't accidentally wipe a count
//   someone already corrected.
// body: { id, offset?, expectedCount? } -> edit a row's manual alignment/
//   validation fields (Module Map's row settings, or an inline edit from
//   Settings -> Module Rows - manager+ only, mirrors Pile Layout's
//   edit-layout gate).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, rowId, offset, expectedCount } = body

    if (id) {
      const session = await getServerSession(authOptions)
      if (!session?.user || !hasRole(session.user.role, 'manager')) {
        return NextResponse.json({ error: 'Only a manager or admin can edit row alignment' }, { status: 403 })
      }
      const updated = await prisma.moduleRow.update({
        where: { id },
        data: {
          offset: typeof offset === 'number' ? offset : undefined,
          expectedCount: expectedCount === null ? null : (typeof expectedCount === 'number' ? expectedCount : undefined),
        },
      })
      return NextResponse.json(updated)
    }

    if (!projectId || !rowId) {
      return NextResponse.json({ error: 'projectId and rowId are required' }, { status: 400 })
    }
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    const existing = await prisma.moduleRow.findUnique({ where: { projectId_rowId: { projectId, rowId } } })
    if (existing) {
      const withSlots = await prisma.moduleRow.findUnique({ where: { id: existing.id }, include: { slots: { orderBy: { position: 'asc' } } } })
      return NextResponse.json(withSlots)
    }

    // Creating a genuinely new row is now only ever a deliberate Settings
    // -> Module Rows action (see addModuleRow in page.tsx) - gated the
    // same as editing one, so a row can never appear in a project without
    // a manager or admin having put it there.
    const session = await getServerSession(authOptions)
    if (!session?.user || !hasRole(session.user.role, 'manager')) {
      return NextResponse.json({ error: 'Only a manager or admin can add a new module row' }, { status: 403 })
    }
    const created = await prisma.moduleRow.create({
      data: { projectId, rowId, expectedCount: typeof expectedCount === 'number' ? expectedCount : undefined },
    })
    return NextResponse.json({ ...created, slots: [] })
  } catch (error) {
    console.error('Error saving module row:', error)
    return NextResponse.json({ error: 'Failed to save module row' }, { status: 500 })
  }
}

// DELETE /api/module-rows?id=... - admin-only correction tool (e.g. a row
// tag scanned by mistake). Deletes every slot in the row too - there's no
// cascade at the DB level, so that has to happen first.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a module row' }, { status: 403 })
    }
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const existing = await prisma.moduleRow.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Module row not found' }, { status: 404 })
    }
    await prisma.moduleSlot.deleteMany({ where: { moduleRowId: id } })
    await prisma.moduleRow.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting module row:', error)
    return NextResponse.json({ error: 'Failed to delete module row' }, { status: 500 })
  }
}
