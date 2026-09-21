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

    // Keep the cached pass/fail counters on the project roughly in sync.
    if (status === 'pass') {
      await prisma.project.update({ where: { id: projectId }, data: { passedInspections: { increment: 1 } } })
    } else if (status === 'fail') {
      await prisma.project.update({ where: { id: projectId }, data: { failedInspections: { increment: 1 } } })
    }

    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Error saving inspection:', error)
    return NextResponse.json({ error: 'Failed to save inspection' }, { status: 500 })
  }
}
