import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Bulk pile QA/QC import - takes the already-parsed, already-converted
// records built client-side by parseQaqcCsvText() (see page.tsx) and writes
// one Inspection, and optionally one Refusal, per pile, upserting a Pile
// layout row first for any pile id this project doesn't already have one
// for. Gated the same as /api/piles (manager+): this is a bulk write
// across potentially thousands of records, not a single field entry, so it
// gets the same bar as editing the pile layout rather than the no-auth-
// check bar that a single POST to /api/inspections or /api/refusals has.
const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

type QaqcRecord = {
  pileId: string // "row-pile"
  row: number
  pile: number
  stickupHeightIn: number | null
  plumbNS: number | null
  plumbEW: number | null
  twistDeg: number | null
  inspectionNotes: string | null
  isRefusal: boolean
  reason: string | null
  finalIntervalIn: number | null
  refusalNotes: string | null
}

// Default target embedment depth (inches) when a record doesn't carry one
// of its own - matches the same fallback /api/refusals itself uses, and
// the demo-data generator's own assumed value. A real per-project design
// value isn't tracked anywhere yet (see Project model) - if one exists for
// this project, re-run the import with overwriteExisting after fixing it
// up some other way, rather than this route guessing per-project values.
const DEFAULT_TARGET_DEPTH_IN = 72

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'manager')) {
      return NextResponse.json({ error: 'Only managers and admins can run a QA/QC import' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, records, overwriteExisting } = body as {
      projectId: string
      records: QaqcRecord[]
      overwriteExisting?: boolean
    }

    if (!projectId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'projectId and a non-empty records array are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    let pilesCreated = 0
    let inspectionsCreated = 0
    let inspectionsSkipped = 0
    let refusalsCreated = 0
    let refusalsSkipped = 0

    for (const rec of records) {
      if (rec.row == null || rec.pile == null || !rec.pileId) continue

      // Ensure a Pile layout row exists so this pile shows up on the Pile
      // Map too - but never touch one that's already there (zone/type/
      // color may have been set by hand) beyond confirming it isn't a
      // skip/gap placeholder.
      const existingPile = await prisma.pile.findUnique({
        where: { projectId_pileId: { projectId, pileId: rec.pileId } },
      })
      if (!existingPile) {
        await prisma.pile.create({
          data: { projectId, pileId: rec.pileId, row: rec.row, position: rec.pile, skip: false },
        })
        pilesCreated++
      }

      // Refusal piles don't get an Inspection record here. getInspectionStatus()
      // client-side (the single source of truth the Pile Map, dashboards and
      // reports all use) checks for an Inspection FIRST and only falls back
      // to a pile's Refusal when none exists - so an Inspection on a refused
      // pile hides the refusal everywhere in the app, not just this one view.
      // The sheet is a drive log, not a QC sign-off, so there's no real
      // pass/fail verdict to record for these piles yet anyway - marking
      // them 'pass' would be inventing a QC result nobody actually made.
      // Their post-angle/stickup/twist readings still aren't lost: they're
      // folded into the Refusal record's own notes below. Once someone
      // does a real follow-up inspection on a resolved refusal, that
      // creates the Inspection record normally and takes over the status.
      const existingInspection = rec.isRefusal
        ? null
        : await prisma.inspection.findUnique({
            where: { projectId_pileId: { projectId, pileId: rec.pileId } },
          })
      if (!rec.isRefusal && (!existingInspection || overwriteExisting)) {
        await prisma.inspection.upsert({
          where: { projectId_pileId: { projectId, pileId: rec.pileId } },
          update: {
            status: 'pass',
            plumbNS: rec.plumbNS ?? undefined,
            plumbEW: rec.plumbEW ?? undefined,
            heightIn: rec.stickupHeightIn ?? undefined,
            twistDeg: rec.twistDeg ?? undefined,
            notes: rec.inspectionNotes ?? undefined,
            userId: session.user.id,
          },
          create: {
            projectId,
            pileId: rec.pileId,
            row: rec.row,
            pile: rec.pile,
            status: 'pass',
            plumbNS: rec.plumbNS ?? null,
            plumbEW: rec.plumbEW ?? null,
            heightIn: rec.stickupHeightIn ?? null,
            twistDeg: rec.twistDeg ?? null,
            notes: rec.inspectionNotes ?? null,
            userId: session.user.id,
          },
        })
        inspectionsCreated++
      } else if (!rec.isRefusal) {
        inspectionsSkipped++
      }

      if (rec.isRefusal) {
        const existingRefusal = await prisma.refusal.findUnique({
          where: { projectId_pileId: { projectId, pileId: rec.pileId } },
        })
        if (!existingRefusal || overwriteExisting) {
          await prisma.refusal.upsert({
            where: { projectId_pileId: { projectId, pileId: rec.pileId } },
            update: {
              reason: rec.reason || 'other',
              targetDepth: DEFAULT_TARGET_DEPTH_IN,
              notes: rec.refusalNotes ?? undefined,
              userId: session.user.id,
            },
            create: {
              projectId,
              pileId: rec.pileId,
              row: rec.row,
              pile: rec.pile,
              reason: rec.reason || 'other',
              targetDepth: DEFAULT_TARGET_DEPTH_IN,
              notes: rec.refusalNotes ?? null,
              userId: session.user.id,
            },
          })
          refusalsCreated++
        } else {
          refusalsSkipped++
        }
      }
    }

    // Recompute the project's cached counters from the real tables rather
    // than incrementing per-row, same reasoning as recomputeProjectPileStats
    // in /api/piles - a bulk run with overwriteExisting can both add and
    // replace records in the same pass, so a running delta would drift.
    const [passedInspections, refusalCount, pileStats] = await Promise.all([
      prisma.inspection.count({ where: { projectId, status: 'pass' } }),
      prisma.refusal.count({ where: { projectId } }),
      prisma.pile.findMany({ where: { projectId }, select: { row: true, skip: true } }),
    ])
    const realPiles = pileStats.filter((p) => !p.skip)
    const maxRow = pileStats.reduce((m, p) => Math.max(m, p.row), 0)

    await prisma.project.update({
      where: { id: projectId },
      data: {
        passedInspections,
        refusalCount,
        ...(pilesCreated > 0
          ? { pileLayoutMode: 'custom', totalPiles: realPiles.length, totalRows: maxRow || undefined }
          : {}),
      },
    })

    return NextResponse.json({
      success: true,
      pilesCreated,
      inspectionsCreated,
      inspectionsSkipped,
      refusalsCreated,
      refusalsSkipped,
      totalRecords: records.length,
    })
  } catch (error) {
    console.error('Error importing pile QA/QC data:', error)
    return NextResponse.json({ error: 'Failed to import pile QA/QC data' }, { status: 500 })
  }
}
