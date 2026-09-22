import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function parsePileId(pileId: string) {
  const parts = String(pileId).split('-')
  return { row: parseInt(parts[0], 10) || 1, pile: parseInt(parts[1], 10) || 1 }
}

// GET /api/inspections?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const inspections = await prisma.inspection.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = inspections.map((i) => ({
      pileId: i.pileId,
      status: i.status,
      inspectedAt: i.createdAt,
      user: i.user,
      depth: i.depth,
      plumbNS: i.plumbNS,
      plumbEW: i.plumbEW,
      failReason: i.failReason,
      photos: i.photos ? JSON.parse(i.photos) : [],
      gps: i.gps ? JSON.parse(i.gps) : null,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching inspections:', error)
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 })
  }
}

// POST /api/inspections
// body: { projectId, pileId, status, inspectedBy, depth?, plumbNS?, plumbEW?, failReason?, photos?, gps? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, pileId, status, inspectedBy, depth, plumbNS, plumbEW, failReason, photos, gps } = body

    if (!projectId || !pileId || !status) {
      return NextResponse.json({ error: 'projectId, pileId and status are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    // Fall back to a real user in this company if the id we were given
    // doesn't correspond to an actual row (e.g. a stale client id).
    let userId: string = inspectedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this inspection to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const { row, pile } = parsePileId(pileId)

    // Look up any existing inspection for this pile first so the cached
    // counters below move by the ACTUAL change in status, not by +1 on
    // every save. Without this, reinspecting a pile (e.g. fail -> pass)
    // incremented both passedInspections and failedInspections forever,
    // so they never matched the real current pass/fail split.
    const existing = await prisma.inspection.findUnique({
      where: { projectId_pileId: { projectId, pileId } },
    })

    const inspection = await prisma.inspection.upsert({
      where: { projectId_pileId: { projectId, pileId } },
      update: {
        status,
        depth: depth ?? undefined,
        plumbNS: plumbNS ?? undefined,
        plumbEW: plumbEW ?? undefined,
        failReason: failReason ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        gps: gps ? JSON.stringify(gps) : undefined,
        userId,
      },
      create: {
        projectId,
        pileId,
        row,
        pile,
        status,
        depth: depth ?? undefined,
        plumbNS: plumbNS ?? undefined,
        plumbEW: plumbEW ?? undefined,
        failReason: failReason ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        gps: gps ? JSON.stringify(gps) : undefined,
        userId,
      },
    })

    // Keep the cached pass/fail counters on the project in sync by the
    // actual delta - a pile that's re-inspected only ever counts once,
    // in whichever bucket its current status is.
    const passedDelta = (existing?.status === 'pass' ? -1 : 0) + (status === 'pass' ? 1 : 0)
    const failedDelta = (existing?.status === 'fail' ? -1 : 0) + (status === 'fail' ? 1 : 0)
    if (passedDelta !== 0 || failedDelta !== 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          passedInspections: passedDelta !== 0 ? { increment: passedDelta } : undefined,
          failedInspections: failedDelta !== 0 ? { increment: failedDelta } : undefined,
        },
      })
    }

    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Error saving inspection:', error)
    return NextResponse.json({ error: 'Failed to save inspection' }, { status: 500 })
  }
}

// DELETE /api/inspections?projectId=...&pileId=...
// Removes a single inspection record and backs out its contribution to the
// project's cached pass/fail counters. There was previously no way to
// correct or remove a bad/test inspection once saved.
export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    const pileId = request.nextUrl.searchParams.get('pileId')
    if (!projectId || !pileId) {
      return NextResponse.json({ error: 'projectId and pileId are required' }, { status: 400 })
    }

    const existing = await prisma.inspection.findUnique({
      where: { projectId_pileId: { projectId, pileId } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    await prisma.inspection.delete({ where: { projectId_pileId: { projectId, pileId } } })

    if (existing.status === 'pass') {
      await prisma.project.update({ where: { id: projectId }, data: { passedInspections: { decrement: 1 } } })
    } else if (existing.status === 'fail') {
      await prisma.project.update({ where: { id: projectId }, data: { failedInspections: { decrement: 1 } } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inspection:', error)
    return NextResponse.json({ error: 'Failed to delete inspection' }, { status: 500 })
  }
}
