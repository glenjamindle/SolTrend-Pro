import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { findBarcodeConflict, clearBarcodeFrom } from '@/lib/moduleBarcode'

const ROLE_RANK: Record<string, number> = { inspector: 1, manager: 2, admin: 3 }
function hasRole(role: string | undefined, min: keyof typeof ROLE_RANK): boolean {
  return (ROLE_RANK[role || ''] || 0) >= ROLE_RANK[min]
}

// GET /api/module-broken?projectId=... - flat inventory list, newest first.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    const broken = await prisma.brokenModule.findMany({ where: { projectId }, orderBy: { loggedAt: 'desc' } })
    return NextResponse.json(broken)
  } catch (error) {
    console.error('Error fetching broken modules:', error)
    return NextResponse.json({ error: 'Failed to fetch broken modules' }, { status: 500 })
  }
}

// POST /api/module-broken - body: { projectId, barcode, reason, notes?, loggedBy, force? }
// Same cross-project conflict check as /api/module-slots and
// /api/module-spares - a broken module's barcode can't silently
// duplicate one already recorded in a slot or in Spares.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, barcode, reason, notes, loggedBy, force } = body
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
    const created = await prisma.brokenModule.create({
      data: { projectId, barcode, reason: reason || 'Damaged in Field', notes: notes || null, loggedBy: loggedBy || null },
    })
    return NextResponse.json(created)
  } catch (error) {
    console.error('Error saving broken module:', error)
    return NextResponse.json({ error: 'Failed to save broken module' }, { status: 500 })
  }
}

// DELETE /api/module-broken?id=... - admin-only, mirrors the delete
// policy used for every other destructive action in this app.
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!hasRole(session.user.role, 'admin')) {
      return NextResponse.json({ error: 'Only an admin can delete a broken module entry' }, { status: 403 })
    }
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const existing = await prisma.brokenModule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Broken module entry not found' }, { status: 404 })
    }
    await prisma.brokenModule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting broken module:', error)
    return NextResponse.json({ error: 'Failed to delete broken module' }, { status: 500 })
  }
}
