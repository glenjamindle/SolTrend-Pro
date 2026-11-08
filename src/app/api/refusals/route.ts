import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notify'
import { shouldAutoRegisterPile, registerPile } from '@/lib/pileStats'

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
      include: {
        user: { select: { name: true } },
        resolvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = refusals.map((r) => ({
      pileId: r.pileId,
      reason: r.reason,
      reportedAt: r.createdAt,
      user: r.user,
      targetDepth: r.targetDepth,
      achievedDepth: r.achievedDepth,
      notes: r.notes,
      status: r.status,
      resolutionNotes: r.resolutionNotes,
      resolvedBy: r.resolvedBy,
      resolvedAt: r.resolvedAt,
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
// body: { projectId, pileId, reason, targetDepth, achievedDepth, notes?, reportedBy, photos?, gps? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, pileId, reason, targetDepth, achievedDepth, notes, reportedBy, photos, gps } = body

    if (!projectId || !pileId || !reason) {
      return NextResponse.json({ error: 'projectId, pileId and reason are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    // Same guard as /api/inspections - a 'custom' layout's rows vary in
    // length, so don't let a refusal get logged against a pile ID that
    // isn't actually part of the imported layout, UNLESS it's right at
    // the edge of what's charted so far (a new row past the last one on
    // file, or the next position along the current last row) - see the
    // matching comment in /api/inspections and shouldAutoRegisterPile().
    if (project.pileLayoutMode === 'custom') {
      const pile = await prisma.pile.findUnique({ where: { projectId_pileId: { projectId, pileId } } })
      if (pile?.skip) {
        return NextResponse.json({ error: `Pile ${pileId} is marked as a gap/obstacle, not a real pile` }, { status: 400 })
      }
      if (!pile) {
        const { row: pileRow, pile: pilePosition } = parsePileId(pileId)
        if (await shouldAutoRegisterPile(projectId, pileRow, pilePosition)) {
          await registerPile(projectId, pileId, pileRow, pilePosition)
        } else {
          return NextResponse.json({ error: `Pile ${pileId} is not part of this project's layout` }, { status: 400 })
        }
      }
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

    // Only a genuinely new pile should move refusalCount - re-logging a
    // refusal for a pile that already has one (e.g. updating the achieved
    // depth) previously incremented the count again every time.
    const existing = await prisma.refusal.findUnique({
      where: { projectId_pileId: { projectId, pileId } },
    })

    const refusal = await prisma.refusal.upsert({
      where: { projectId_pileId: { projectId, pileId } },
      update: {
        reason,
        targetDepth: targetDepth ?? 72,
        achievedDepth: achievedDepth ?? undefined,
        notes: notes ?? undefined,
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
        targetDepth: targetDepth ?? 72,
        achievedDepth: achievedDepth ?? undefined,
        notes: notes ?? undefined,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : undefined,
        gps: gps ? JSON.stringify(gps) : undefined,
        userId,
      },
    })

    if (!existing) {
      await prisma.project.update({ where: { id: projectId }, data: { refusalCount: { increment: 1 } } })
      await createNotification({
        type: 'refusal',
        message: 'New refusal logged at pile ' + pileId + ' (' + reason + ') on ' + project.name,
        companyId: project.companyId,
        projectId,
      })
    }

    return NextResponse.json(refusal)
  } catch (error) {
    console.error('Error saving refusal:', error)
    return NextResponse.json({ error: 'Failed to save refusal' }, { status: 500 })
  }
}

// PATCH /api/refusals
// body: { projectId, pileId, status, resolutionNotes?, resolvedBy }
// Updates a refusal's remediation status (open / resolved / redesign_required)
// without touching the original field-logged data (reason, targetDepth,
// achievedDepth, notes, photos, gps) - resolutionNotes is a separate field
// for what was done to close it out, not a replacement of what was logged
// at the time of the refusal. Reopening (status: 'open') clears
// resolvedBy/resolvedAt so a reopened refusal doesn't carry a stale
// "resolved by / at" from a previous resolution.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, pileId, status, resolutionNotes, resolvedBy } = body

    if (!projectId || !pileId || !status) {
      return NextResponse.json({ error: 'projectId, pileId and status are required' }, { status: 400 })
    }
    if (!['open', 'resolved', 'redesign_required'].includes(status)) {
      return NextResponse.json({ error: 'status must be open, resolved, or redesign_required' }, { status: 400 })
    }

    const existing = await prisma.refusal.findUnique({
      where: { projectId_pileId: { projectId, pileId } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Refusal not found' }, { status: 404 })
    }

    const isReopen = status === 'open'
    let resolvedById: string | null = null
    if (!isReopen) {
      const userExists = resolvedBy ? await prisma.user.findUnique({ where: { id: resolvedBy } }) : null
      resolvedById = userExists ? userExists.id : null
    }

    const refusal = await prisma.refusal.update({
      where: { projectId_pileId: { projectId, pileId } },
      data: {
        status,
        resolutionNotes: isReopen ? null : (resolutionNotes ?? existing.resolutionNotes),
        resolvedById: isReopen ? null : resolvedById,
        resolvedAt: isReopen ? null : new Date(),
      },
      include: {
        user: { select: { name: true } },
        resolvedBy: { select: { name: true } },
      },
    })

    return NextResponse.json(refusal)
  } catch (error) {
    console.error('Error updating refusal:', error)
    return NextResponse.json({ error: 'Failed to update refusal' }, { status: 500 })
  }
}

// DELETE /api/refusals?projectId=...&pileId=...
// Removes a single refusal record and backs out its contribution to the
// project's cached refusalCount. There was previously no way to correct or
// remove a bad/misclicked refusal once saved.
export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    const pileId = request.nextUrl.searchParams.get('pileId')
    if (!projectId || !pileId) {
      return NextResponse.json({ error: 'projectId and pileId are required' }, { status: 400 })
    }

    const existing = await prisma.refusal.findUnique({
      where: { projectId_pileId: { projectId, pileId } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Refusal not found' }, { status: 404 })
    }

    await prisma.refusal.delete({ where: { projectId_pileId: { projectId, pileId } } })
    await prisma.project.update({ where: { id: projectId }, data: { refusalCount: { decrement: 1 } } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting refusal:', error)
    return NextResponse.json({ error: 'Failed to delete refusal' }, { status: 500 })
  }
}
