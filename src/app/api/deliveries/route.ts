import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/deliveries?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const deliveries = await prisma.delivery.findMany({
      where: { projectId },
      include: { material: { select: { name: true, unit: true } } },
      orderBy: { date: 'desc' },
    })

    const shaped = deliveries.map((d) => ({
      id: d.id,
      materialId: d.materialId,
      material: d.material?.name || 'Unknown',
      unit: d.material?.unit || 'units',
      quantity: d.quantity,
      supplier: d.supplier,
      receivedBy: d.receivedBy,
      date: d.date,
      notes: d.notes,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}

// POST /api/deliveries
// body: { projectId, materialId, quantity, supplier?, receivedBy?, date?, notes?, loggedBy }
// Logs one delivery and increments its material's deliveredQty in the same
// transaction, so that running total can never drift from this log.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, materialId, quantity, supplier, receivedBy, date, notes, loggedBy } = body

    if (!projectId || !materialId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'projectId, materialId, and a positive quantity are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }
    const material = await prisma.material.findUnique({ where: { id: materialId } })
    if (!material || material.projectId !== projectId) {
      return NextResponse.json({ error: 'Unknown material for this project' }, { status: 404 })
    }

    let userId: string = loggedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this delivery to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const [delivery] = await prisma.$transaction([
      prisma.delivery.create({
        data: {
          projectId,
          materialId,
          quantity,
          supplier: supplier || undefined,
          receivedBy: receivedBy || undefined,
          date: date ? new Date(date) : undefined,
          notes: notes || undefined,
          userId,
        },
      }),
      prisma.material.update({
        where: { id: materialId },
        data: { deliveredQty: { increment: quantity } },
      }),
    ])

    return NextResponse.json(delivery)
  } catch (error) {
    console.error('Error saving delivery:', error)
    return NextResponse.json({ error: 'Failed to save delivery' }, { status: 500 })
  }
}
