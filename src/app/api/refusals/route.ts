import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function parsePileId(pileId: string) {
  const parts = String(pileId).split('-')
  return { row: parseInt(parts[0], 10) || 1, pile: parseInt(parts[1], 10) || 1 }
}

// GET /api/refusals?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const refusals = await prisma.refusal.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = refusals.map((r) => ({
      pileId: r.pileId,
      reason: r.reason,
      reportedAt: r.createdAt,
      user: r.user,
      targetDepth: r.targetDepth,
      achievedDepth: r.achievedDepth,
      status: r.status,
      photos: r.photos ? JSON.parse(r.photos) : [],
      gps: r.gps ? JSON.parse(r.gps) : null,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching refusals:', error)
    return NextResponse.json({ error: 'Failed to fetch refusals' }, { status: 500 })
  }
}

// POST /api/refusals
// body: { projectId, pileId, reason, targetDepth, achievedDepth, reportedBy, photos?, gps? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, pileId, reason, targetDepth, achievedDepth, reportedBy, photos, gps } = body

    if (!projectId || !pileId || !reason) {
      return NextResponse.json({ error: 'projectId, pileId and reason are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    let userId: string = reportedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this refusal to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const { row, pile } = parsePileId(pileId)

    const refusal = await prisma.refusal.upsert({
      where: { projectId_pileId: { projectId, pileId } },
      update: {
        reason,
        targetDepth: targetDepth ?? 1800,
        achievedDepth: achievedDepth ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        gps: gps ? JSON.stringify(gps) : undefined,
        userId,
      },
      create: {
        projectId,
        pileId,
        row,
        pile,
        reason,
        targetDepth: targetDepth ?? 1800,
        achievedDepth: achievedDepth ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        gps: gps ? JSON.stringify(gps) : undefined,
        userId,
      },
    })

    await prisma.project.update({ where: { id: projectId }, data: { refusalCount: { increment: 1 } } })

    return NextResponse.json(refusal)
  } catch (error) {
    console.error('Error saving refusal:', error)
    return NextResponse.json({ error: 'Failed to save refusal' }, { status: 500 })
  }
}
