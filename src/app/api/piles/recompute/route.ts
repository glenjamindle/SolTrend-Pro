import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Re-syncs a custom-layout project's cached totalPiles/totalRows from the
// real Pile table - the same recompute /api/piles and /api/pile-qaqc-import
// already do after a write, exposed as its own action for the Pile Layout
// settings tab's "Resync from pile layout" button. That button exists
// because a custom-layout project has no Standard Grid option (rows x
// piles/row makes no sense once there's a real per-pile layout), so if its
// cached totals ever drift from the real table - exactly what happened to
// Hogan, when an unrelated project-details save overwrote them with a
// rows*pilesPerRow value - this is the one place left to put them right
// without re-running the whole layout import.
const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

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
    const { projectId } = body as { projectId: string }
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const piles = await prisma.pile.findMany({ where: { projectId }, select: { row: true, skip: true } })
    const realPiles = piles.filter((p) => !p.skip)
    const maxRow = piles.reduce((m, p) => Math.max(m, p.row), 0)

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        totalPiles: realPiles.length,
        totalRows: maxRow || undefined,
      },
    })

    return NextResponse.json({ success: true, totalPiles: project.totalPiles, totalRows: project.totalRows })
  } catch (error) {
    console.error('Error recomputing pile stats:', error)
    return NextResponse.json({ error: 'Failed to recompute pile stats' }, { status: 500 })
  }
}
