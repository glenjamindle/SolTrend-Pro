import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/notifications?companyId=...
// Returns the 30 most recent notifications for the company (read and
// unread) plus the unread count, so the bell icon can show a badge without
// a second request.
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({ where: { companyId, read: false } }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST /api/notifications
// body: { action: 'markRead', id } - marks a single notification read
// body: { action: 'markAllRead', companyId } - marks every notification for
// the company read (used by the "clear all" control in the bell dropdown)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'markRead') {
      if (!body.id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }
      await prisma.notification.update({ where: { id: body.id }, data: { read: true } })
      return NextResponse.json({ success: true })
    }

    if (action === 'markAllRead') {
      if (!body.companyId) {
        return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
      }
      await prisma.notification.updateMany({ where: { companyId: body.companyId, read: false }, data: { read: true } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
