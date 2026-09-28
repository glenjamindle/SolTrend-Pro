import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/portfolio?companyId=...
// Company-wide rollup across every active project: reuses each project's
// already-cached stats (totalPiles, installedPiles, passed/failedInspections,
// health) and layers on fresh per-project counts that aren't cached anywhere
// else (open RFIs, open safety incidents, overdue submittals, COIs expiring
// within 30 days), plus a combined weekly production trend for the last ~8
// weeks. Archived projects are excluded - this is a "what needs my attention
// right now" view, not a historical archive.
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const projects = await prisma.project.findMany({
      where: { companyId, status: { not: 'archived' } },
      orderBy: { name: 'asc' },
    })

    if (projects.length === 0) {
      return NextResponse.json({ projects: [], weeklyTrend: [] })
    }

    const projectIds = projects.map((p) => p.id)
    const soon = new Date(Date.now() + 30 * 86400000)

    const [openRfiCounts, openIncidentCounts, overdueSubmittalCounts, expiringCoiCounts] = await Promise.all([
      prisma.rfi.groupBy({ by: ['projectId'], where: { projectId: { in: projectIds }, status: { not: 'closed' } }, _count: { id: true } }),
      prisma.safetyIncident.groupBy({ by: ['projectId'], where: { projectId: { in: projectIds }, status: { not: 'closed' } }, _count: { id: true } }),
      prisma.submittal.groupBy({ by: ['projectId'], where: { projectId: { in: projectIds }, dueDate: { lt: new Date() }, status: { notIn: ['approved', 'approved_as_noted'] } }, _count: { id: true } }),
      prisma.coi.groupBy({ by: ['projectId'], where: { projectId: { in: projectIds }, expiresAt: { lt: soon } }, _count: { id: true } }),
    ])

    const toMap = (rows: { projectId: string; _count: { id: number } }[]) =>
      rows.reduce((acc: Record<string, number>, r) => { acc[r.projectId] = r._count.id; return acc }, {})

    const rfiMap = toMap(openRfiCounts)
    const incidentMap = toMap(openIncidentCounts)
    const submittalMap = toMap(overdueSubmittalCounts)
    const coiMap = toMap(expiringCoiCounts)

    const shaped = projects.map((p) => {
      const openRfis = rfiMap[p.id] || 0
      const openIncidents = incidentMap[p.id] || 0
      const overdueSubmittals = submittalMap[p.id] || 0
      const expiringCois = coiMap[p.id] || 0
      const needsAttention = p.health === 'red' || openIncidents > 0 || overdueSubmittals > 0 || expiringCois > 0
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        health: p.health,
        totalPiles: p.totalPiles,
        installedPiles: p.installedPiles,
        percentComplete: p.totalPiles > 0 ? Math.round((p.installedPiles / p.totalPiles) * 100) : 0,
        passedInspections: p.passedInspections,
        failedInspections: p.failedInspections,
        refusalCount: p.refusalCount,
        openRfis,
        openIncidents,
        overdueSubmittals,
        expiringCois,
        needsAttention,
      }
    })

    // Weekly production trend: bucket the last 8 weeks (56 days) of daily
    // entries across every project into 7-day sums. Prisma has no native
    // "group by week", so pull the raw rows and bucket them here.
    const windowStart = new Date(Date.now() - 56 * 86400000)
    const entries = await prisma.productionEntry.findMany({
      where: { projectId: { in: projectIds }, date: { gte: windowStart } },
      select: { date: true, pilesInstalled: true },
    })

    const weeklyTrend: { weekStart: string; piles: number }[] = []
    for (let w = 7; w >= 0; w--) {
      const bucketStart = new Date(Date.now() - (w + 1) * 7 * 86400000)
      const bucketEnd = new Date(Date.now() - w * 7 * 86400000)
      const piles = entries
        .filter((e) => e.date >= bucketStart && e.date < bucketEnd)
        .reduce((sum, e) => sum + (e.pilesInstalled || 0), 0)
      weeklyTrend.push({ weekStart: bucketStart.toISOString().slice(0, 10), piles })
    }

    return NextResponse.json({ projects: shaped, weeklyTrend })
  } catch (error) {
    console.error('Error fetching portfolio report:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio report' }, { status: 500 })
  }
}
