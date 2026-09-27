import { prisma } from './db'

// Shared helper for creating in-app notifications from any API route (a
// failed inspection, a new refusal, a day that came in well short of
// target). Notifications are read inside the app only - no email/SMS - so
// this is just a DB insert, never anything that can fail a request if a
// mail provider is down.
export async function createNotification(params: {
  type: string
  message: string
  companyId: string
  projectId?: string | null
}) {
  try {
    await prisma.notification.create({
      data: {
        type: params.type,
        message: params.message,
        companyId: params.companyId,
        projectId: params.projectId || undefined,
      },
    })
  } catch (error) {
    // Never let a notification failure break the save it's attached to.
    console.error('Error creating notification:', error)
  }
}
