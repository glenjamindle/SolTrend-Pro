import { prisma } from '@/lib/db'

// Recomputes a custom-layout project's cached totalPiles/totalRows from the
// real Pile table. Called from /api/piles after a manual add, CSV import,
// or delete, so the cached totals stay in sync with whatever the layout
// actually is.
//
// Note: "totalRows" here is the Pile table's row/position GRID - a purely
// visual layout used to draw the Pile Map (and bound Inspection/Refusal
// nav), not a count of the field's own physical rows. A pile's real-world
// identity lives entirely in its pileId string (e.g. "128-9"), which is
// independent of this grid - see the comment on resolvePileAt() in
// page.tsx for the full explanation. Don't use totalRows as a proxy for
// "how many rows exist in the field."
//
// Auto-registering a pile that isn't in this table was tried and
// deliberately removed (see git history around Nov 2026) - Glen: field
// crews don't pay attention and will keep logging against piles that
// don't exist, corrupting the layout. A project's piles come ONLY from the
// grid default or an explicit CSV import/manual edit in Settings -> Pile
// Layout - never from Inspection/Refusal logging.
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
