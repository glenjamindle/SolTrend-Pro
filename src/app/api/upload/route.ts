import { NextRequest, NextResponse } from 'next/server'
import { uploadPhoto } from '@/lib/storage'

// POST /api/upload
// body: { dataUrl: "data:image/jpeg;base64,...", context: "inspection"|"refusal"|"production", pileId?: string }
// Uploads one photo (already resized/compressed client-side) to the private
// storage bucket and returns { key, url }. url is a same-origin path
// (/api/photos/...) that proxies the bytes back through this app - the
// caller doesn't need direct bucket access.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataUrl, context, pileId } = body

    if (!dataUrl || typeof dataUrl !== 'string') {
      return NextResponse.json({ error: 'dataUrl is required' }, { status: 400 })
    }

    const safeContext = ['inspection', 'refusal', 'production'].includes(context) ? context : 'misc'
    const safePileId = typeof pileId === 'string' ? pileId.replace(/[^a-zA-Z0-9_-]/g, '') : ''
    const keyPrefix = [safeContext, safePileId].filter(Boolean).join('/')

    const { key, url } = await uploadPhoto(dataUrl, keyPrefix)
    return NextResponse.json({ key, url })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}
