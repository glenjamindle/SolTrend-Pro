import { prisma } from '@/lib/db'

// Recomputes a custom-layout project's cached totalPiles/totalRows from the
// real Pile table. Originally lived only in /api/piles (after a manual add,
// CSV import, or delete); now also called from /api/inspections and
// /api/refusals whenever logging a pile auto-registers a new row/position
// there (see shouldAutoRegisterPile/registerPile below), so the cached
// totals stay correct no matter which of the three routes last changed the
// layout.
export async function recomputeProjectPileStats(projectId: string) {
  const piles = await prisma.pile.findMany({ where: { projectId }, select: { row: true, skip: true } })
  const real = piles.filter((p) => !p.skip)
  const maxRow = piles.reduce((m, p) => Math.max(m, p.row), 0)
  await prisma.project.update({
    where: { id: projectId },
    data: {
      pileLayoutMode: 'custom',
      totalPiles: real.length,
      totalRows: maxRow || undefined,
    },
  })
}

// Whether a pile ID that isn't in the Pile table yet should be
// auto-registered rather than rejected, for a custom-layout project.
// True only at the genuine edge of what's charted so far:
//  - a row beyond the project's current max row (nothing charted there
//    yet - the site has grown, or was under-captured in the original
//    import, past what's on file), or
//  - the very next position along the current last row (walking one
//    pile further than what's currently charted - the same situation,
//    one level down, for a last row whose own real width was also
//    under-captured).
// A position inside an already-charted, already-known-to-be-short row
// (e.g. row 5 really only has 9 piles, but something asks for "5-25")
// still returns false - that's the original bug this whole guard exists
// to catch (a client nav bug walking off the end of a short row), not a
// legitimately new pile, and it stays rejected exactly as before.
export async function shouldAutoRegisterPile(projectId: string, row: number, position: number): Promise<boolean> {
  const maxRowAgg = await prisma.pile.aggregate({ where: { projectId }, _max: { row: true } })
  const maxRow = maxRowAgg._max.row || 0
  if (row > maxRow) return true
  if (row === maxRow) {
    const maxPosAgg = await prisma.pile.aggregate({ where: { projectId, row }, _max: { position: true } })
    const maxPos = maxPosAgg._max.position || 0
    return position === maxPos + 1
  }
  return false
}

// Creates the bare Pile record (no zone/type/color - just enough for the
// layout guard to recognize it and for the Pile Map to draw it) and
// refreshes the project's cached totals. Only call once
// shouldAutoRegisterPile has confirmed it's safe to.
export async function registerPile(projectId: string, pileId: string, row: number, position: number) {
  await prisma.pile.create({ data: { projectId, pileId, row, position, skip: false } })
  await recomputeProjectPileStats(projectId)
}
