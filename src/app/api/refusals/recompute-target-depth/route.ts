import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { resolveTargetDepthIn, parsePileTypeSpecs, DEFAULT_TARGET_DEPTH_IN } from '@/lib/targetDepth'

// Recomputes Refusal.targetDepth from the project's real racking-profile
// data (see ../../../../lib/targetDepth.ts) instead of the flat 72in
// fallback every refusal - old and newly-imported alike - has shipped
// with so far. Same preview-then-apply shape as ../pile-qaqc-import/revert:
// GET previews what would change with no mutation, POST actually writes
// it. Gated manager+ like the import route itself, not admin-only like
// the revert - this corrects values toward the truth rather than deleting
// anything, and (unlike revert) nothing about it is time-windowed or
// import-specific, so there's less room for it to go wrong by scope alone.
const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

async function requireManager() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  if (!hasRole(session.user.role, 'manager')) {
    return { error: NextResponse.json({ error: 'Only managers and admins can recalculate target depths' }, { status: 403 }) }
  }
  return { session }
}

// Shared by GET and POST: for every refusal on the project, work out what
// its target depth *should* be from current racking-profile/pile-type
// data, and how that compares to what's on file now.
async function computePlan(projectId: string) {
  const [project, refusals, piles] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.refusal.findMany({ where: { projectId }, select: { id: true, pileId: true, targetDepth: true } }),
    prisma.pile.findMany({ where: { projectId }, select: { pileId: true, pileType: true } }),
  ])
  if (!project) return { error: 'Unknown project' as const }

  const rackingProfile = project.rackingProfileId
    ? await prisma.rackingProfile.findUnique({ where: { id: project.rackingProfileId } })
    : null
  const pileTypeSpecs = parsePileTypeSpecs(rackingProfile?.pileTypeSpecs ?? null)

  const pileTypeByPileId = new Map(piles.map((p) => [p.pileId, p.pileType] as const))

  const changes: { id: string; pileId: string; from: number; to: number }[] = []
  let matchedByPileType = 0
  let matchedBySingleType = 0
  let stillFallback = 0
  let alreadyCorrect = 0

  for (const r of refusals) {
    const pileType = pileTypeByPileId.get(r.pileId) ?? null
    const resolved = resolveTargetDepthIn(pileType, pileTypeSpecs)
    if (resolved === r.targetDepth) {
      alreadyCorrect++
      continue
    }
    changes.push({ id: r.id, pileId: r.pileId, from: r.targetDepth, to: resolved })
    if (pileType && resolved !== DEFAULT_TARGET_DEPTH_IN) matchedByPileType++
    else if (resolved !== DEFAULT_TARGET_DEPTH_IN) matchedBySingleType++
    else stillFallback++
  }

  return {
    projectName: project.name,
    rackingProfileName: rackingProfile?.name ?? null,
    pileTypeCount: Array.isArray(pileTypeSpecs) ? pileTypeSpecs.length : 0,
    totalRefusals: refusals.length,
    alreadyCorrect,
    changes,
    matchedByPileType,
    matchedBySingleType,
    stillFallback,
  }
}

// GET /api/refusals/recompute-target-depth?projectId=...
export async function GET(request: NextRequest) {
  const auth = await requireManager()
  if (auth.error) return auth.error

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 })

  const plan = await computePlan(projectId)
  if ('error' in plan) return NextResponse.json({ error: plan.error }, { status: 404 })

  return NextResponse.json({
    projectName: plan.projectName,
    rackingProfileName: plan.rackingProfileName,
    pileTypeCount: plan.pileTypeCount,
    totalRefusals: plan.totalRefusals,
    alreadyCorrect: plan.alreadyCorrect,
    wouldChange: plan.changes.length,
    matchedByPileType: plan.matchedByPileType,
    matchedBySingleType: plan.matchedBySingleType,
    stillFallback: plan.stillFallback,
    sample: plan.changes.slice(0, 10).map((c) => ({ pileId: c.pileId, from: c.from, to: c.to })),
  })
}

// POST /api/refusals/recompute-target-depth  { projectId }
export async function POST(request: NextRequest) {
  const auth = await requireManager()
  if (auth.error) return auth.error

  const body = await request.json().catch(() => ({}))
  const projectId = body.projectId as string | undefined
  if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 })

  const plan = await computePlan(projectId)
  if ('error' in plan) return NextResponse.json({ error: plan.error }, { status: 404 })

  if (plan.changes.length > 0) {
    await prisma.$transaction(
      plan.changes.map((c) => prisma.refusal.update({ where: { id: c.id }, data: { targetDepth: c.to } }))
    )
  }

  return NextResponse.json({
    success: true,
    updated: plan.changes.length,
    alreadyCorrect: plan.alreadyCorrect,
    matchedByPileType: plan.matchedByPileType,
    matchedBySingleType: plan.matchedBySingleType,
    stillFallback: plan.stillFallback,
  })
}
