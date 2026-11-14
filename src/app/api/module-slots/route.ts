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

// PATCH /api/module-slots - the three things that can happen to an
// already-installed slot after the fact, all gated on the slot's own
// flaggedBroken state rather than on role (flagging/replacing is routine
// field work, same openness as logging a Refusal or a Spare - only
// deleting a slot outright, below, is admin-only). body: { id, action }
// action 'flag'    - { id, reason, flaggedBy } - mark an installed slot
//                     broken in place. Fails if it has no barcode yet
//                     (nothing installed there to flag) or is already
//                     flagged.
// action 'replace' - { id, newBarcode, replacedBy, force? } - swap in a
//                     new barcode at this exact row/position, same
//                     conflict check every other scan goes through (see
//                     findBarcodeConflict/clearBarcodeFrom), then clears
//                     the flag and writes a ModuleFlagHistory row
//                     (resolution: 'replaced') so there's a before/after
//                     record. Fails if the slot isn't currently flagged.
// action 'resolve' - { id, resolvedBy } - clears the flag with no barcode
//                     change (false alarm, or fixed without a swap) and
//                     still writes a ModuleFlagHistory row (resolution:
//                     'cleared') for the same paper-trail reason.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body as { id?: string; action?: string }
    if (!id || !action) {
      return NextResponse.json({ error: 'id and action are required' }, { status: 400 })
    }
    const slot = await prisma.moduleSlot.findUnique({ where: { id }, include: { moduleRow: true } })
    if (!slot) {
      return NextResponse.json({ error: 'Module slot not found' }, { status: 404 })
    }
    const projectId = slot.moduleRow.projectId

    if (action === 'flag') {
      const { reason, flaggedBy } = body as { reason?: string; flaggedBy?: string }
      if (!slot.barcode) {
        return NextResponse.json({ error: 'Nothing is scanned into this position to flag' }, { status: 400 })
      }
      if (slot.flaggedBroken) {
        return NextResponse.json({ error: 'This module is already flagged' }, { status: 409 })
      }
      if (!reason || typeof reason !== 'string') {
        return NextResponse.json({ error: 'reason is required' }, { status: 400 })
      }
      const updated = await prisma.moduleSlot.update({
        where: { id },
        data: { flaggedBroken: true, flaggedReason: reason, flaggedBy: flaggedBy || null, flaggedAt: new Date() },
      })
      return NextResponse.json(updated)
    }

    if (action === 'replace') {
      const { newBarcode, replacedBy, force } = body as { newBarcode?: string; replacedBy?: string; force?: boolean }
      if (!slot.flaggedBroken) {
        return NextResponse.json({ error: 'This slot is not flagged broken' }, { status: 400 })
      }
      if (!newBarcode || typeof newBarcode !== 'string') {
        return NextResponse.json({ error: 'newBarcode is required' }, { status: 400 })
      }
      const conflict = await findBarcodeConflict(projectId, newBarcode)
      if (conflict && !force) {
        return NextResponse.json({ error: 'Barcode already recorded elsewhere in this project', conflict }, { status: 409 })
      }
      if (conflict && force) {
        await clearBarcodeFrom(conflict, projectId, newBarcode)
      }
      const [updated] = await prisma.$transaction([
        prisma.moduleSlot.update({
          where: { id },
          data: {
            barcode: newBarcode,
            scannedAt: new Date(),
            scannedBy: replacedBy || null,
            flaggedBroken: false,
            flaggedReason: null,
            flaggedBy: null,
            flaggedAt: null,
          },
        }),
        prisma.moduleFlagHistory.create({
          data: {
            projectId,
            rowId: slot.moduleRow.rowId,
            position: slot.position,
            oldBarcode: slot.barcode as string,
            reason: slot.flaggedReason as string,
            flaggedBy: slot.flaggedBy,
            flaggedAt: slot.flaggedAt as Date,
            resolution: 'replaced',
            newBarcode,
            resolvedBy: replacedBy || null,
          },
        }),
      ])
      return NextResponse.json(updated)
    }

    if (action === 'resolve') {
      const { resolvedBy } = body as { resolvedBy?: string }
      if (!slot.flaggedBroken) {
        return NextResponse.json({ error: 'This slot is not flagged broken' }, { status: 400 })
      }
      const [updated] = await prisma.$transaction([
        prisma.moduleSlot.update({
          where: { id },
          data: { flaggedBroken: false, flaggedReason: null, flaggedBy: null, flaggedAt: null },
        }),
        prisma.moduleFlagHistory.create({
          data: {
            projectId,
            rowId: slot.moduleRow.rowId,
            position: slot.position,
            oldBarcode: slot.barcode as string,
            reason: slot.flaggedReason as string,
            flaggedBy: slot.flaggedBy,
            flaggedAt: slot.flaggedAt as Date,
            resolution: 'cleared',
            newBarcode: null,
            resolvedBy: resolvedBy || null,
          },
        }),
      ])
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating module slot:', error)
    return NextResponse.json({ error: 'Failed to update module slot' }, { status: 500 })
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
