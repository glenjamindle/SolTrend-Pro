import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/module-flag-history?projectId=... - read-only list of resolved
// post-install flags (see ModuleSlot.flaggedBroken in schema.prisma),
// newest first. Written only by /api/module-slots' 'replace' and
// 'resolve' actions - there's no POST/DELETE here, this is a paper trail,
// not something edited directly.
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    const history = await prisma.moduleFlagHistory.findMany({ where: { projectId }, orderBy: { resolvedAt: 'desc' } })
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching module flag history:', error)
    return NextResponse.json({ error: 'Failed to fetch module flag history' }, { status: 500 })
  }
}
