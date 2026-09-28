import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// This route manages Project.piles - the real per-pile layout data that
// backs a "custom" pile map (see the Pile model's comment in schema.prisma).
// Writing here is a project-configuration change, same tier as editing a
// project or a racking profile in Settings, so it's gated at manager and up;
// clearing a project's whole layout is destructive and admin-only, matching
// every other delete in the app.
const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

type PileInput = {
  pileId?: string
  row: number
  position: number
  zone?: string | null
  pileType?: string | null
  color?: string | null
  skip?: boolean
  lat?: number | null
  lng?: number | null
  notes?: string | null
}

function derivePileId(p: PileInput): string {
  return p.pileId && String(p.pileId).trim() ? String(p.pileId).trim() : `${p.row}-${p.position}`
}

// Recomputes the cached totals a "custom" layout project should show
// elsewhere in the app (Active Projects cards, Company Dashboard) so
// totalPiles keeps meaning something once it's no longer just
// totalRows * pilesPerRow. installedPiles/passedInspections etc are left
// alone here - those are still driven by actual Inspection records.
async function recomputeProjectPileStats(projectId: string) {
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

// GET /api/piles?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    const piles = await prisma.pile.findMany({
      where: { projectId },
      orderBy: [{ row: 'asc' }, { position: 'asc' }],
    })
    return NextResponse.json(piles)
  } catch (error) {
    console.error('Error fetching piles:', error)
    return NextResponse.json({ error: 'Failed to fetch piles' }, { status: 500 })
  }
}

// POST /api/piles
// body: { projectId, piles: PileInput[] } - bulk import/upsert (CSV import,
// or a single-pile add/edit from the manual editor sending a one-item array)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'manager')) {
      return NextResponse.json({ error: 'Only managers and admins can edit the pile layout' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, piles } = body as { projectId: string; piles: PileInput[] }

    if (!projectId || !Array.isArray(piles) || piles.length === 0) {
      return NextResponse.json({ error: 'projectId and a non-empty piles array are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    let written = 0
    for (const p of piles) {
      if (p.row == null || p.position == null) continue
      const pileId = derivePileId(p)
      await prisma.pile.upsert({
        where: { projectId_pileId: { projectId, pileId } },
        update: {
          row: p.row,
          position: p.position,
          zone: p.zone ?? undefined,
          pileType: p.pileType ?? undefined,
          color: p.color ?? undefined,
          skip: p.skip ?? false,
          lat: p.lat ?? undefined,
          lng: p.lng ?? undefined,
          notes: p.notes ?? undefined,
        },
        create: {
          projectId,
          pileId,
          row: p.row,
          position: p.position,
          zone: p.zone ?? null,
          pileType: p.pileType ?? null,
          color: p.color ?? null,
          skip: p.skip ?? false,
          lat: p.lat ?? null,
          lng: p.lng ?? null,
          notes: p.notes ?? null,
        },
      })
      written++
    }

    await recomputeProjectPileStats(projectId)

    return NextResponse.json({ success: true, written })
  } catch (error) {
    console.error('Error saving piles:', error)
    return NextResponse.json({ error: 'Failed to save piles' }, { status: 500 })
  }
}

// DELETE /api/piles?projectId=...&pileId=...          - remove one pile
// DELETE /api/piles?projectId=...&clearAll=true        - wipe the whole
//   custom layout and revert the project to the procedural grid (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const projectId = request.nextUrl.searchParams.get('projectId')
    const pileId = request.nextUrl.searchParams.get('pileId')
    const clearAll = request.nextUrl.searchParams.get('clearAll') === 'true'
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    if (clearAll) {
      if (!hasRole(session.user.role, 'admin')) {
        return NextResponse.json({ error: 'Only admins can clear a project\'s pile layout' }, { status: 403 })
      }
      const project = await prisma.project.findUnique({ where: { id: projectId } })
      if (!project) {
        return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
      }
      await prisma.pile.deleteMany({ where: { projectId } })
      await prisma.project.update({
        where: { id: projectId },
        data: {
          pileLayoutMode: 'grid',
          totalPiles: project.totalRows * project.pilesPerRow,
        },
      })
      return NextResponse.json({ success: true })
    }

    if (!hasRole(session.user.role, 'manager')) {
      return NextResponse.json({ error: 'Only managers and admins can edit the pile layout' }, { status: 403 })
    }
    if (!pileId) {
      return NextResponse.json({ error: 'pileId is required' }, { status: 400 })
    }
    await prisma.pile.delete({ where: { projectId_pileId: { projectId, pileId } } })
    await recomputeProjectPileStats(projectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pile(s):', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
