import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { findBarcodeConflict, clearBarcodeFrom } from '@/lib/moduleBarcode'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// POST /api/module-slots - scanning one module barcode into the current
// row. Always appends at the next position in that row (position is
// never chosen by the caller - it's derived here the same instant the
// slot is created, so there's no window for two scans to race onto the
// same position). Before that, checks whether the barcode is already
// recorded ANYWHERE else in the project (another slot, or Spares/Broken)
// - if so, and the caller hasn't passed force:true, this returns 409 with
// a `conflict` describing where it already lives, instead of creating a
// duplicate. The client's "Move it here" action resends the same request
// with force:true, which clears the barcode from its old spot first.
// body: { projectId, moduleRowId, barcode, scannedBy, force? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, moduleRowId, barcode, scannedBy, force } = body

    if (!projectId || !moduleRowId || !barcode || typeof barcode !== 'string') {
      return NextResponse.json({ error: 'projectId, moduleRowId, and barcode are required' }, { status: 400 })
    }

    const row = await prisma.moduleRow.findUnique({ where: { id: moduleRowId } })
    if (!row || row.projectId !== projectId) {
      return NextResponse.json({ error: 'Unknown module row for this project' }, { status: 404 })
    }

    const conflict = await findBarcodeConflict(projectId, barcode)
    if (conflict && !force) {
      return NextResponse.json({ error: 'Barcode already recorded elsewhere in this project', conflict }, { status: 409 })
    }
    if (conflict && force) {
      await clearBarcodeFrom(conflict, projectId, barcode)
    }

    const last = await prisma.moduleSlot.findFirst({ where: { moduleRowId }, orderBy: { position: 'desc' } })
    const nextPosition = (last?.position || 0) + 1

    const created = await prisma.moduleSlot.create({
      data: {
        moduleRowId,
        position: nextPosition,
        barcode,
        scannedAt: new Date(),
        scannedBy: scannedBy || null,
      },
    })
    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving module slot:', error)
    return NextResponse.json({ error: 'Failed to save module slot' }, { status: 500 })
  }
}

// DELETE /api/module-slots?id=... - admin-only correction tool (a bad
// scan that needs removing outright, as opposed to the field "pull it
// down, log it Broken later" flow, which is a separate deliberate step
// per the design doc, not a delete).
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a module slot' }, { status: 403 })
    }
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const existing = await prisma.moduleSlot.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Module slot not found' }, { status: 404 })
    }
    await prisma.moduleSlot.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting module slot:', error)
    return NextResponse.json({ error: 'Failed to delete module slot' }, { status: 500 })
  }
}
