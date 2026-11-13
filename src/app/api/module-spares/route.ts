import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { findBarcodeConflict, clearBarcodeFrom } from '@/lib/moduleBarcode'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/module-spares?projectId=... - flat inventory list, newest first.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    const spares = await prisma.spareModule.findMany({ where: { projectId }, orderBy: { loggedAt: 'desc' } })
    return NextResponse.json(spares)
  } catch (error) {
    console.error('Error fetching spare modules:', error)
    return NextResponse.json({ error: 'Failed to fetch spare modules' }, { status: 500 })
  }
}

// POST /api/module-spares - body: { projectId, barcode, notes?, loggedBy, force? }
// Same cross-project conflict check as /api/module-slots - a spare's
// barcode can't silently duplicate one already in a slot or in Broken.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, barcode, notes, loggedBy, force } = body
    if (!projectId || !barcode || typeof barcode !== 'string') {
      return NextResponse.json({ error: 'projectId and barcode are required' }, { status: 400 })
    }
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
    }
    const conflict = await findBarcodeConflict(projectId, barcode)
    if (conflict && !force) {
      return NextResponse.json({ error: 'Barcode already recorded elsewhere in this project', conflict }, { status: 409 })
    }
    if (conflict && force) {
      await clearBarcodeFrom(conflict, projectId, barcode)
    }
    const created = await prisma.spareModule.create({
      data: { projectId, barcode, notes: notes || null, loggedBy: loggedBy || null },
    })
    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving spare module:', error)
    return NextResponse.json({ error: 'Failed to save spare module' }, { status: 500 })
  }
}

// DELETE /api/module-spares?id=... - admin-only, mirrors the delete
// policy used for every other destructive action in this app.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a spare module entry' }, { status: 403 })
    }
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const existing = await prisma.spareModule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Spare module entry not found' }, { status: 404 })
    }
    await prisma.spareModule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting spare module:', error)
    return NextResponse.json({ error: 'Failed to delete spare module' }, { status: 500 })
  }
}
