import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// One-time (and occasionally-needed-again) admin tool: wipe test/demo
// production data for a project before real field data starts flowing.
// Deliberately narrow in scope - it only ever touches:
//   - ProductionEntry rows (the daily pile/table/module install log)
//   - Project.installedPiles / tablesInstalled / modulesInstalled (the
//     cached counters those entries roll up into)
// and, only when includeQc is explicitly true:
//   - Inspection and Refusal rows
//   - Project.passedInspections / failedInspections / refusalCount
// It never touches Pile (the real pile-map/layout data - a completely
// separate concept from production counts) and never touches anything
// outside the chosen project. Admin-only, same tier as clearing a custom
// pile layout in /api/piles.
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
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only admins can reset production data' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { projectId, includeQc } = body as { projectId?: string; includeQc?: boolean }
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const production = await tx.productionEntry.deleteMany({ where: { projectId } })

      let inspections = { count: 0 }
      let refusals = { count: 0 }
      if (includeQc) {
        inspections = await tx.inspection.deleteMany({ where: { projectId } })
        refusals = await tx.refusal.deleteMany({ where: { projectId } })
      }

      await tx.project.update({
        where: { id: projectId },
        data: {
          installedPiles: 0,
          tablesInstalled: 0,
          modulesInstalled: 0,
          ...(includeQc ? { passedInspections: 0, failedInspections: 0, refusalCount: 0 } : {}),
        },
      })

      return {
        productionEntriesDeleted: production.count,
        inspectionsDeleted: inspections.count,
        refusalsDeleted: refusals.count,
      }
    })

    return NextResponse.json({ success: true, project: project.name, ...result })
  } catch (error) {
    console.error('Error resetting production data:', error)
    return NextResponse.json({ error: 'Failed to reset production data' }, { status: 500 })
  }
}
