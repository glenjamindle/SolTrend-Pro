import { prisma } from '@/lib/db'

// Module Scan never lets the same barcode live in two places at once -
// another slot, or the Spare/Broken inventory logs - without the person
// scanning it being told and given the choice to move it. See
// claude/module-barcode-scanning-design.md: "A rescan of an already-filled
// ModuleSlot, or a barcode that's already recorded anywhere else in the
// project... still always gets flagged rather than silently overwritten."
export type BarcodeConflict =
  | { type: 'slot'; rowId: string; position: number; scannedAt: Date | null }
  | { type: 'spare'; loggedAt: Date }
  | { type: 'broken'; reason: string; loggedAt: Date }

export async function findBarcodeConflict(projectId: string, barcode: string): Promise<BarcodeConflict | null> {
  const slot = await prisma.moduleSlot.findFirst({
    where: { barcode, moduleRow: { projectId } },
    include: { moduleRow: true },
  })
  if (slot) {
    return { type: 'slot', rowId: slot.moduleRow.rowId, position: slot.position, scannedAt: slot.scannedAt }
  }
  const spare = await prisma.spareModule.findFirst({ where: { projectId, barcode } })
  if (spare) {
    return { type: 'spare', loggedAt: spare.loggedAt }
  }
  const broken = await prisma.brokenModule.findFirst({ where: { projectId, barcode } })
  if (broken) {
    return { type: 'broken', reason: broken.reason, loggedAt: broken.loggedAt }
  }
  return null
}

// Removes a barcode from wherever findBarcodeConflict found it, so "Move
// it here" relocates a barcode instead of leaving a duplicate behind.
// Only call this after findBarcodeConflict has confirmed where it lives.
export async function clearBarcodeFrom(conflict: BarcodeConflict, projectId: string, barcode: string): Promise<void> {
  if (conflict.type === 'slot') {
    await prisma.moduleSlot.updateMany({
      where: { barcode, moduleRow: { projectId } },
      data: { barcode: null, scannedAt: null, scannedBy: null },
    })
  } else if (conflict.type === 'spare') {
    await prisma.spareModule.deleteMany({ where: { projectId, barcode } })
  } else if (conflict.type === 'broken') {
    await prisma.brokenModule.deleteMany({ where: { projectId, barcode } })
  }
}
