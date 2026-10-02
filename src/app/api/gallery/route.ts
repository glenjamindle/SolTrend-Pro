import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/gallery?projectId=...
// Returns this project's standalone gallery photos - the ones added
// directly from the Gallery tab, not attached to an inspection, refusal,
// or production entry (the app combines all four sources client-side for
// the Gallery view itself; see renderGallery() in page.tsx).
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const photos = await prisma.galleryPhoto.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })

    const shaped = photos.map((p) => ({
      id: p.id,
      url: p.fileUrl,
      key: p.fileKey,
      caption: p.caption,
      date: p.date.toISOString().split('T')[0],
      user: p.user?.name || 'Unknown',
      createdAt: p.createdAt,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching gallery photos:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery photos' }, { status: 500 })
  }
}

// POST /api/gallery
// body: { projectId, photos: [{ key, url }], caption?, date?, uploadedBy }
// Creates one GalleryPhoto row per item in photos, all sharing the same
// caption/date - a batch upload (e.g. a supervisor adding a dozen phone
// photos from one site visit) is one date and one caption, not one of
// each per photo. Open to any logged-in role, same as logging production
// or an inspection - a field crew member taking photos shouldn't need a
// manager around to file them.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, photos, caption, date, uploadedBy } = body as {
      projectId: string
      photos: { key: string; url: string }[]
      caption?: string
      date?: string
      uploadedBy: string
    }

    if (!projectId || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'projectId and a non-empty photos array are required' }, { status: 400 })
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
        return NextResponse.json({ error: 'No user available to attribute these photos to' }, { status: 400 })
      }
      userId = fallbackUser.id
    }

    // Same day-only normalization as Production Entry - a plain "YYYY-MM-DD"
    // from the calendar picker, parsed and re-anchored to UTC midnight so the
    // stored date doesn't drift a day depending on server/client timezone.
    const day = date ? new Date(date) : new Date()
    const photoDate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()))

    const created = await prisma.$transaction(
      photos.map((p) =>
        prisma.galleryPhoto.create({
          data: {
            projectId,
            userId,
            fileKey: p.key,
            fileUrl: p.url,
            caption: caption || null,
            date: photoDate,
          },
        })
      )
    )

    return NextResponse.json({ success: true, created: created.length })
  } catch (error) {
    console.error('Error saving gallery photos:', error)
    return NextResponse.json({ error: 'Failed to save gallery photos' }, { status: 500 })
  }
}

// DELETE /api/gallery?projectId=...&id=...
// Removes one standalone gallery photo. Gated at manager+ like every other
// delete in the app (pile layout, documents, etc.) - uploading stays open
// to everyone, but removing someone else's photo is a step up in tier.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'manager')) {
      return NextResponse.json({ error: 'Only managers and admins can delete gallery photos' }, { status: 403 })
    }

    const projectId = request.nextUrl.searchParams.get('projectId')
    const id = request.nextUrl.searchParams.get('id')
    if (!projectId || !id) {
      return NextResponse.json({ error: 'projectId and id are required' }, { status: 400 })
    }

    const existing = await prisma.galleryPhoto.findUnique({ where: { id } })
    if (!existing || existing.projectId !== projectId) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    await prisma.galleryPhoto.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery photo:', error)
    return NextResponse.json({ error: 'Failed to delete gallery photo' }, { status: 500 })
  }
}
