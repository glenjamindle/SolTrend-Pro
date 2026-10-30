import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Undo for a bulk QA/QC import (see ../route.ts) gone wrong - e.g. the
// pile IDs it wrote don't actually match the project's real layout. There's
// no per-import batch id anywhere in the schema, so this works off a time
// window instead: every Inspection/Refusal/Pile row a bulk import creates
// lands within the same few seconds, and nothing else in the app writes
// all three of those tables in one request. GET previews what a given
// window would remove (own admin check, no mutation) before DELETE
// actually removes it. Admin-only, not manager+ like the import itself -
// this is a blunter, harder-to-undo instrument than the import is.
const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  if (!hasRole(session.user.role, 'admin')) return { error: NextResponse.json({ error: 'Admin only' }, { status: 403 }) }
  return { session }
}

function parseWindow(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('projectId')
  const since = request.nextUrl.searchParams.get('since')
  const until = request.nextUrl.searchParams.get('until')
  if (!projectId || !since) return { error: 'projectId and since are required' as const }
  const sinceDate = new Date(since)
  const untilDate = until ? new Date(until) : new Date()
  if (isNaN(sinceDate.getTime()) || isNaN(untilDate.getTime())) return { error: 'since/until must be valid timestamps' as const }
  return { projectId, sinceDate, untilDate }
}

// GET /api/pile-qaqc-import/revert?projectId=...&since=ISO&until=ISO
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const parsed = parseWindow(request)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { projectId, sinceDate, untilDate } = parsed

  const where = { projectId, createdAt: { gte: sinceDate, lte: untilDate } }
  const [inspections, refusals, piles] = await Promise.all([
    prisma.inspection.findMany({ where, select: { pileId: true } }),
    prisma.refusal.findMany({ where, select: { pileId: true } }),
    prisma.pile.findMany({ where, select: { pileId: true } }),
  ])

  return NextResponse.json({
    window: { since: sinceDate.toISOString(), until: untilDate.toISOString() },
    inspectionsToDelete: inspections.length,
    refusalsToDelete: refusals.length,
    pilesToDelete: piles.length,
    samplePileIds: [...inspections, ...refusals, ...piles].slice(0, 10).map((r) => r.pileId),
  })
}

// DELETE /api/pile-qaqc-import/revert?projectId=...&since=ISO&until=ISO
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const parsed = parseWindow(request)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { projectId, sinceDate, untilDate } = parsed

  const where = { projectId, createdAt: { gte: sinceDate, lte: untilDate } }

  const [deletedInspections, deletedRefusals, deletedPiles] = await Promise.all([
    prisma.inspection.deleteMany({ where }),
    prisma.refusal.deleteMany({ where }),
    prisma.pile.deleteMany({ where }),
  ])

  // Recompute every cached counter from the real tables, same reasoning as
  // the import route itself - a window delete can remove an arbitrary mix
  // of rows, so a running decrement would drift just as a running
  // increment would on the way in.
  const [passedInspections, failedInspections, refusalCount, pileStats] = await Promise.all([
    prisma.inspection.count({ where: { projectId, status: 'pass' } }),
    prisma.inspection.count({ where: { projectId, status: 'fail' } }),
    prisma.refusal.count({ where: { projectId } }),
    prisma.pile.findMany({ where: { projectId }, select: { row: true, skip: true } }),
  ])
  const realPiles = pileStats.filter((p) => !p.skip)
  const maxRow = pileStats.reduce((m, p) => Math.max(m, p.row), 0)

  await prisma.project.update({
    where: { id: projectId },
    data: {
      passedInspections,
      failedInspections,
      refusalCount,
      totalPiles: realPiles.length,
      totalRows: maxRow || undefined,
    },
  })

  return NextResponse.json({
    success: true,
    deletedInspections: deletedInspections.count,
    deletedRefusals: deletedRefusals.count,
    deletedPiles: deletedPiles.count,
  })
}
