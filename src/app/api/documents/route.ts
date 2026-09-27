import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/documents?projectId=...
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const documents = await prisma.document.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = documents.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      fileUrl: d.fileUrl,
      fileType: d.fileType,
      fileSize: d.fileSize,
      uploadedBy: d.user?.name || 'Unknown',
      createdAt: d.createdAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST /api/documents
// body: { projectId, title, category, fileKey, fileUrl, fileType?, fileSize?, uploadedBy }
// The file itself is uploaded separately via /api/upload-document first;
// this just records the resulting key/url against the project.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, title, category, fileKey, fileUrl, fileType, fileSize, uploadedBy } = body

    if (!projectId || !title || !category || !fileKey || !fileUrl) {
      return NextResponse.json({ error: 'projectId, title, category, fileKey, and fileUrl are required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }

    let userId: string = uploadedBy
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { companyId: project.companyId } })
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user available to attribute this document to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    const created = await prisma.document.create({
      data: {
        projectId,
        title,
        category,
        fileKey,
        fileUrl,
        fileType: fileType || undefined,
        fileSize: typeof fileSize === 'number' ? fileSize : undefined,
        userId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving document:', error)
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }
}

// DELETE /api/documents?id=... - admin-only, same delete policy as everywhere else.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a document' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existing = await prisma.document.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    await prisma.document.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
