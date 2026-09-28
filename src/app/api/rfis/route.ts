import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/rfis?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const rfis = await prisma.rfi.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = rfis.map((r) => ({
      id: r.id,
      number: r.number,
      subject: r.subject,
      category: r.category,
      question: r.question,
      submittedTo: r.submittedTo,
      blocking: r.blocking,
      status: r.status,
      answer: r.answer,
      answeredAt: r.answeredAt,
      photos: r.photos ? JSON.parse(r.photos) : [],
      submittedBy: r.user?.name || 'Unknown',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching RFIs:', error)
    return NextResponse.json({ error: 'Failed to fetch RFIs' }, { status: 500 })
  }
}

// POST /api/rfis
// body: { id?, projectId, number?, subject, category?, question, submittedTo?, blocking?, photos?, status?, answer?, submittedBy }
// No id -> creates a new RFI (auto-numbers RFI-001, RFI-002, ... per project).
// With id -> updates it in place (used to answer/close it, or edit details).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectId, number, subject, category, question, submittedTo, blocking, photos, status, answer, submittedBy } = body

    if (!projectId || (!id && (!subject || !question))) {
      return NextResponse.json({ error: 'projectId, subject, and question are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    if (id) {
      const existing = await prisma.rfi.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'RFI not found' }, { status: 404 })
      }
      const answeredAt = status
        ? (status === 'answered' || status === 'closed'
            ? (existing.answeredAt ? existing.answeredAt : new Date())
            : status === 'open' ? null : undefined)
        : undefined
      const updated = await prisma.rfi.update({
        where: { id },
        data: {
          subject: subject ?? undefined,
          category: category ?? undefined,
          question: question ?? undefined,
          submittedTo: submittedTo ?? undefined,
          blocking: typeof blocking === 'boolean' ? blocking : undefined,
          photos: Array.isArray(photos) ? JSON.stringify(photos) : undefined,
          status: status ?? undefined,
          answer: answer ?? undefined,
          answeredAt,
        },
      })
      return NextResponse.json(updated)
    }

    let userId: string = submittedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this RFI to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    let rfiNumber = number
    if (!rfiNumber) {
      const count = await prisma.rfi.count({ where: { projectId } })
      rfiNumber = `RFI-${String(count + 1).padStart(3, '0')}`
    }

    const created = await prisma.rfi.create({
      data: {
        projectId,
        number: rfiNumber,
        subject,
        category: category || 'other',
        question,
        submittedTo: submittedTo || null,
        blocking: !!blocking,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : null,
        status: 'open',
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving RFI:', error)
    return NextResponse.json({ error: 'Failed to save RFI' }, { status: 500 })
  }
}

// DELETE /api/rfis?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete an RFI' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.rfi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'RFI not found' }, { status: 404 })
    }

    await prisma.rfi.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting RFI:', error)
    return NextResponse.json({ error: 'Failed to delete RFI' }, { status: 500 })
  }
}
